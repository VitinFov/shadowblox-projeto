-- SHADOWBLOX V3 - SEGURANCA, RLS E ESTOQUE
-- Execute somente depois de revisar a migration_v2.
-- Objetivo: corrigir pontos críticos sem apagar produtos, imagens, pedidos ou usuários.

begin;

-- =========================================================
-- 1. OWNER OFICIAL
-- =========================================================

-- Ajuste aqui se o owner for outro e-mail.
update public.profiles
set role = 'owner',
    is_admin = true,
    blocked = false,
    updated_at = now()
where lower(coalesce(email, '')) = 'ffj6303@gmail.com';

-- =========================================================
-- 2. FUNCOES AUXILIARES
-- =========================================================

create or replace function public.uuid_or_null(p_text text)
returns uuid
language plpgsql
immutable
as $$
begin
  return p_text::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case
        when blocked then 'blocked'
        else role
      end
      from public.profiles
      where id = auth.uid()
    ),
    'customer'
  );
$$;

create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = any(allowed_roles);
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'owner';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array['owner','admin']);
$$;

-- =========================================================
-- 3. PROTEGER OWNER, CARGOS E USUARIO BLOQUEADO
-- =========================================================

create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- O owner nunca pode ser rebaixado por update direto.
  if old.role = 'owner' and new.role <> 'owner' then
    raise exception 'O proprietário não pode ser rebaixado';
  end if;

  -- Usuário não pode mexer no próprio cargo/bloqueio.
  if auth.uid() is not null and old.id = auth.uid() then
    if new.role is distinct from old.role
       or new.is_admin is distinct from old.is_admin
       or new.blocked is distinct from old.blocked
       or new.blocked_reason is distinct from old.blocked_reason then
      raise exception 'Você não pode alterar seu próprio cargo ou bloqueio';
    end if;
  end if;

  -- Somente owner pode alterar cargo/bloqueio de qualquer usuário.
  if auth.uid() is not null and not public.is_owner() then
    if new.role is distinct from old.role
       or new.is_admin is distinct from old.is_admin
       or new.blocked is distinct from old.blocked
       or new.blocked_reason is distinct from old.blocked_reason then
      raise exception 'Somente o owner pode alterar cargos ou bloqueios';
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_security_fields_trigger on public.profiles;
create trigger protect_profile_security_fields_trigger
before update on public.profiles
for each row execute function public.protect_profile_security_fields();

-- =========================================================
-- 4. PEDIDOS: ESTOQUE E APROVACAO SEGURA
-- =========================================================

alter table public.orders
add column if not exists stock_deducted boolean not null default false;

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

create or replace function public.create_order(p_payment_method text, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_total integer := 0;
  v_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Faça login para finalizar a compra';
  end if;

  -- Cartão/Mercado Pago será liberado em outra etapa, via backend.
  if p_payment_method not in ('pix') then
    raise exception 'Forma de pagamento indisponível no momento';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'Carrinho grande demais';
  end if;

  select * into v_profile
  from public.profiles
  where id = auth.uid();

  if not found then
    raise exception 'Perfil não encontrado';
  end if;

  if coalesce(v_profile.blocked, false) then
    raise exception 'Conta bloqueada';
  end if;

  insert into public.orders(id, user_id, customer_name, customer_email, status, payment_method, total_cents)
  values(v_order_id, auth.uid(), v_profile.full_name, v_profile.email, 'awaiting_payment', p_payment_method, 0);

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if (v_item->>'product_id') is null then
      raise exception 'Produto inválido';
    end if;

    v_quantity := greatest(1, least(100, coalesce((v_item->>'quantity')::integer, 1)));

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for share;

    if not found then
      raise exception 'Produto não encontrado';
    end if;

    if not v_product.active
       or not v_product.visible
       or v_product.out_of_stock
       or v_product.stock < v_quantity then
      raise exception 'Produto indisponível: %', v_product.name;
    end if;

    v_total := v_total + (v_product.price_cents * v_quantity);

    insert into public.order_items(order_id, product_id, product_name, quantity, unit_price_cents)
    values(v_order_id, v_product.id, v_product.name, v_quantity, v_product.price_cents);
  end loop;

  update public.orders
  set total_cents = v_total,
      updated_at = now()
  where id = v_order_id;

  return v_order_id;

exception when others then
  delete from public.orders where id = v_order_id;
  raise;
end;
$$;

create unique index if not exists payment_receipts_order_id_unique
on public.payment_receipts(order_id);

create or replace function public.submit_payment_receipt(p_order_id uuid, p_file_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_expected_prefix text;
begin
  if auth.uid() is null then
    raise exception 'Faça login para enviar comprovante';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found or v_order.user_id <> auth.uid() then
    raise exception 'Pedido não encontrado';
  end if;

  if v_order.status <> 'awaiting_payment' then
    raise exception 'Este pedido não aceita novo comprovante';
  end if;

  v_expected_prefix := auth.uid()::text || '/' || p_order_id::text || '/';

  if p_file_path is null or position(v_expected_prefix in p_file_path) <> 1 then
    raise exception 'Caminho do comprovante inválido';
  end if;

  insert into public.payment_receipts(order_id, user_id, file_path)
  values(p_order_id, auth.uid(), p_file_path)
  on conflict (order_id) do update
  set file_path = excluded.file_path,
      created_at = now();

  update public.orders
  set status = 'under_review',
      updated_at = now()
  where id = p_order_id;
end;
$$;

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.orders%rowtype;
  v_item record;
  v_product public.products%rowtype;
begin
  if not public.has_role(array['owner','admin']) then
    raise exception 'Acesso negado';
  end if;

  if p_status not in ('under_review','paid','rejected','cancelled','refunded') then
    raise exception 'Status inválido';
  end if;

  select * into v_old
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado';
  end if;

  -- Ao aprovar pagamento, baixa o estoque uma única vez.
  if p_status = 'paid' and not v_old.stock_deducted then
    for v_item in
      select *
      from public.order_items
      where order_id = p_order_id
    loop
      select * into v_product
      from public.products
      where id = v_item.product_id
      for update;

      if not found then
        raise exception 'Produto do pedido não encontrado';
      end if;

      if v_product.stock < v_item.quantity then
        raise exception 'Estoque insuficiente para: %', v_product.name;
      end if;

      update public.products
      set stock = stock - v_item.quantity,
          out_of_stock = case when stock - v_item.quantity <= 0 then true else out_of_stock end,
          updated_at = now()
      where id = v_product.id;
    end loop;

    update public.orders
    set stock_deducted = true
    where id = p_order_id;
  end if;

  update public.orders
  set status = p_status,
      updated_at = now()
  where id = p_order_id;

  perform public.log_admin_action(
    'order_status',
    'order',
    p_order_id::text,
    to_jsonb(v_old),
    jsonb_build_object('status', p_status),
    null
  );

  if p_status = 'paid'
     and not exists(select 1 from public.chat_messages where order_id = p_order_id) then
    insert into public.chat_messages(order_id, sender_id, message)
    values(p_order_id, auth.uid(), 'Pagamento aprovado! Mande uma mensagem para receber o item.');
  end if;
end;
$$;

-- =========================================================
-- 5. CHAT E ACESSO AO PEDIDO
-- =========================================================

create or replace function public.can_access_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.orders o
    where o.id = p_order_id
      and (
        o.user_id = auth.uid()
        or public.has_role(array['owner','admin'])
        or (
          public.current_role() = 'delivery_staff'
          and o.status in ('paid','in_service','delivered')
          and (o.assigned_to is null or o.assigned_to = auth.uid())
        )
      )
  );
$$;

create or replace function public.can_chat_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.status in ('paid','in_service','delivered')
      and (
        o.user_id = auth.uid()
        or public.has_role(array['owner','admin'])
        or (
          public.current_role() = 'delivery_staff'
          and o.assigned_to = auth.uid()
        )
      )
  );
$$;

-- Permite marcar como lida somente mensagens de pedidos permitidos.
drop policy if exists "chat permitted update read" on public.chat_messages;

create policy "chat permitted update read"
on public.chat_messages for update to authenticated
using (public.can_chat_order(order_id))
with check (public.can_chat_order(order_id));

grant update(read_at) on public.chat_messages to authenticated;

-- =========================================================
-- 6. AVALIACOES IMUTAVEIS
-- =========================================================

drop policy if exists "reviews owner edit seven days" on public.store_reviews;

revoke update(rating, comment, updated_at) on public.store_reviews from authenticated;

-- As respostas e moderação continuam via RPC:
-- respond_to_review(...)
-- toggle_review_visibility(...)

-- =========================================================
-- 7. STORAGE MAIS RESTRITO
-- =========================================================

drop policy if exists "order members manage chat attachments" on storage.objects;
drop policy if exists "chat attachments allowed read" on storage.objects;
drop policy if exists "chat attachments allowed upload" on storage.objects;
drop policy if exists "chat attachments own delete" on storage.objects;

create policy "chat attachments allowed read"
on storage.objects for select to authenticated
using (
  bucket_id = 'chat-attachments'
  and public.can_chat_order(public.uuid_or_null((storage.foldername(name))[1]))
);

create policy "chat attachments allowed upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'chat-attachments'
  and public.can_chat_order(public.uuid_or_null((storage.foldername(name))[1]))
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "chat attachments own delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'chat-attachments'
  and public.can_chat_order(public.uuid_or_null((storage.foldername(name))[1]))
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Reforca comprovante: caminho precisa ser userId/orderId/arquivo.
drop policy if exists "user uploads own receipt" on storage.objects;
drop policy if exists "user or finance reads receipt" on storage.objects;

create policy "user uploads own receipt"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.orders o
    where o.id = public.uuid_or_null((storage.foldername(name))[2])
      and o.user_id = auth.uid()
      and o.status = 'awaiting_payment'
  )
);

create policy "user or finance reads receipt"
on storage.objects for select to authenticated
using (
  bucket_id = 'receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_role(array['owner','admin'])
  )
);

-- =========================================================
-- 8. GRANTS
-- =========================================================

grant execute on function public.uuid_or_null(text) to anon, authenticated;
grant execute on function public.current_role() to anon, authenticated;
grant execute on function public.has_role(text[]) to anon, authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.is_admin() to authenticated;

grant execute on function public.create_order(text,jsonb) to authenticated;
grant execute on function public.submit_payment_receipt(uuid,text) to authenticated;
grant execute on function public.set_order_status(uuid,text) to authenticated;

commit;
