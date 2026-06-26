# Shadowblox — versão atualizada

Projeto atualizado com:

- Página inicial sem os cards visuais repetidos de categorias;
- Banner principal sem o botão “Ver ofertas”;
- Banner Sailor Piece como entrada única para o catálogo;
- Catálogo interno com menu lateral expansível e subcategorias em texto;
- Produtos com imagens, preços, descontos, estoque e status esgotado;
- Login real com Google e Discord via Supabase;
- Carrinho, Pix estático e envio de comprovante;
- Painel do proprietário e administrador;
- Controle de preços, estoque, produto oculto e fora de estoque;
- Cargos owner, admin, delivery_staff e customer;
- Painel de atendimento e entregas;
- Chat do pedido usando Supabase Realtime;
- Avaliações públicas com estrelas, comentário e compra verificada;
- Resposta da loja e moderação de avaliações;
- Regras RLS e funções seguras no Supabase.

## Não há chaves secretas neste projeto

As variáveis abaixo continuam no Replit Secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Nunca coloque `SUPABASE_SECRET_KEY` ou `service_role` no frontend.

## Atualização obrigatória do Supabase

Abra o Supabase → SQL Editor → New query e execute todo o arquivo:

`supabase/migration_v2.sql`

A migration:

- mantém sua conta `nova61899@gmail.com` como `owner`;
- cria os cargos e permissões;
- cadastra as categorias e produtos;
- cria as funções de pedidos, entrega, chat e avaliações;
- atualiza as políticas RLS;
- cria os buckets necessários.

## Executar no Replit

```bash
npm install
npm start
```

O projeto usa porta `process.env.PORT || 5000` e está preparado para Autoscale Deployment.

## Publicação

Depois de substituir os arquivos:

1. Teste no Preview;
2. Entre com Discord ou Google;
3. Confirme no Supabase → Table Editor → profiles que seu usuário está com `role = owner`;
4. Clique em Republish no Replit.

## Painéis

Após entrar como owner, o link “Painel da equipe” aparece no rodapé.

O owner pode:

- alterar produtos e estoque;
- aprovar pedidos;
- adicionar administradores;
- adicionar funcionários de entrega;
- bloquear usuários;
- acompanhar chats e entregas;
- responder ou ocultar avaliações.

O delivery_staff pode:

- ver pedidos pagos disponíveis;
- assumir atendimento;
- conversar no chat;
- marcar como entregue.

## Observação sobre cartão

O botão de cartão continua preparado, mas o Mercado Pago ainda precisa ser integrado antes de receber pagamentos reais por crédito ou débito.
