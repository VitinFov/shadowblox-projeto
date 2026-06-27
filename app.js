(() => {
  'use strict';

  const cfg = window.SHADOWBLOX_CONFIG || {};
  const runtime = window.SHADOWBLOX_RUNTIME || {};
  const pixCode = runtime.pixCode || cfg.pixCode || '';
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const CATEGORY_META = [
    { id: 'novo', name: 'Novo' },
    { id: 'combos', name: 'Combos' },
    { id: 'contas', name: 'Contas' },
    { id: 'gamepass', name: 'Gamepass' },
    { id: 'sets', name: 'Sets (Estilos de luta) - Personagens' },
    { id: 'upgrades', name: 'Upgrade - Ascensões & B10' },
    { id: 'reliquias', name: 'Set Relíquias' },
    { id: 'rerolls', name: 'Rerolls' },
    { id: 'caixas', name: 'Caixas' }
  ];

  const FALLBACK_PRODUCTS = [
    { id:'cla-rerolls',name:'Clã Rerolls (10k - 30k - 70k)',category_slug:'rerolls',price_cents:870,old_price_cents:null,image_path:'assets/products/cla-rerolls.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'race-rerolls',name:'Race Rerolls (100k - 500k - 1M)',category_slug:'rerolls',price_cents:950,old_price_cents:null,image_path:'assets/products/race-rerolls.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'trait-rerolls',name:'Trait Rerolls (100k - 500k - 1M)',category_slug:'rerolls',price_cents:982,old_price_cents:null,image_path:'assets/products/trait-rerolls.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'passive-rerolls',name:'Passive Rerolls (100k - 500k - 1M)',category_slug:'rerolls',price_cents:935,old_price_cents:null,image_path:'assets/products/passive-rerolls.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'power-shard',name:'Power Shard (50k - 300k - 500k)',category_slug:'rerolls',price_cents:940,old_price_cents:null,image_path:'assets/products/power-shard.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'rimuru',name:'Rimuru (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:null,image_path:'assets/products/rimuru.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'true-aizen',name:'True Aizen V2 + F (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:3200,image_path:'assets/products/true-aizen.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'kokushibo',name:'Kokushibo + F Set (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:3000,image_path:'assets/products/kokushibo.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'saber-alt',name:'Saber Alt + F Set (Estilo de luta)',category_slug:'sets',price_cents:954,old_price_cents:2700,image_path:'assets/products/saber-alt.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'gilgamesh-set',name:'Gilgamesh + F Set (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:2600,image_path:'assets/products/gilgamesh-set.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'madara-set',name:'Madara + F Set (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:2900,image_path:'assets/products/madara-set.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'atomic-v2-set',name:'Atomic V2 Set (Estilo de luta)',category_slug:'sets',price_cents:1000,old_price_cents:2600,image_path:'assets/products/atomic-v2-set.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'dio-brando',name:'Dio Brando (The World)',category_slug:'sets',price_cents:1420,old_price_cents:2500,image_path:'assets/products/dio-brando.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'ice-queen',name:'Lançamento Ice Queen',category_slug:'sets',price_cents:1300,old_price_cents:5000,image_path:'assets/products/ice-queen.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'ragna',name:'Limited Ragna - Top 1',category_slug:'sets',price_cents:3720,old_price_cents:20000,image_path:'assets/products/ragna.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'madoka',name:'Madoka Set (Top 2 Estilo de luta)',category_slug:'sets',price_cents:3000,old_price_cents:15000,image_path:'assets/products/madoka.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'cartheliya',name:'Cartheliya + F (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:1900,image_path:'assets/products/cartheliya.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'gojo',name:'Gojo + F (Estilo de luta)',category_slug:'sets',price_cents:953,old_price_cents:2200,image_path:'assets/products/gojo.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'atomic-b10',name:'Atomic V2 + B10 + Título',category_slug:'upgrades',price_cents:2550,old_price_cents:5000,image_path:'assets/products/atomic-b10.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'gilgamesh-b10',name:'Gilgamesh + F Set + B10 + Título',category_slug:'upgrades',price_cents:2750,old_price_cents:5000,image_path:'assets/products/gilgamesh-b10.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:false,is_new:false },
    { id:'2x-drops',name:'2X Drops (Gamepass)',category_slug:'gamepass',price_cents:920,old_price_cents:1500,image_path:'assets/products/2x-drops.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'2x-luck',name:'2X Luck (Gamepass)',category_slug:'gamepass',price_cents:920,old_price_cents:2000,image_path:'assets/products/2x-luck.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'combo-personagens',name:'Exdeath + Madara + Atomic + Kokushibo Set',category_slug:'combos',price_cents:3520,old_price_cents:8000,image_path:'assets/products/combo-personagens.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'combo-caixas',name:'300 Cosmetic Crates + 300 Auras Crates',category_slug:'combos',price_cents:1720,old_price_cents:5000,image_path:'assets/products/combo-caixas.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:false },
    { id:'spirit-key',name:'Spirit Key',category_slug:'reliquias',price_cents:950,old_price_cents:null,image_path:'assets/products/spirit-key.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:true },
    { id:'spirit-stone',name:'Spirit Stone',category_slug:'reliquias',price_cents:950,old_price_cents:null,image_path:'assets/products/spirit-stone.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:true },
    { id:'cosmic-being',name:'Set Cosmic Being (Garou)',category_slug:'reliquias',price_cents:1350,old_price_cents:null,image_path:'assets/products/cosmic-being.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:true },
    { id:'sun-god-yoriichi',name:'Set Sun God (Yoriichi)',category_slug:'sets',price_cents:1250,old_price_cents:2500,image_path:'assets/products/sun-god-yoriichi.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:true },
    { id:'black-reaper',name:'Black Reaper (Kaneki)',category_slug:'sets',price_cents:1200,old_price_cents:2500,image_path:'assets/products/black-reaper.jpg',stock:999,visible:true,active:true,out_of_stock:false,featured:true,is_new:true }
  ];

  const state = {
    supabase: null,
    user: null,
    profile: null,
    products: [...FALLBACK_PRODUCTS],
    categories: [...CATEGORY_META],
    cart: readLocal('shadowblox_cart', []),
    selectedCategory: 'novo',
    search: '',
    sort: 'featured',
    receiptFile: null,
    orders: [],
    reviews: [],
    reviewRating: 5,
    chatOrderId: null,
    chatChannel: null,
    dashboardTab: 'overview'
  };

  function readLocal(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function writeLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function toast(message) {
    const element = q('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 3000);
  }

  function openDialog(selector) {
    const dialog = q(selector);
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closeDialogs() {
    qa('dialog[open]').forEach((dialog) => dialog.close());
  }

  function formatMoney(cents) {
    return money.format((Number(cents) || 0) / 100);
  }

  function categoryName(slug) {
    return CATEGORY_META.find((item) => item.id === slug)?.name || slug;
  }

  function roleIn(...roles) {
    return roles.includes(state.profile?.role);
  }

  function isStaff() {
    return roleIn('owner', 'admin', 'delivery_staff');
  }

  function canManageProducts() {
    return roleIn('owner', 'admin');
  }

  function canManageTeam() {
    return roleIn('owner');
  }

  function canManagePayments() {
    return roleIn('owner', 'admin');
  }

  function isDatabaseReady() {
    return Boolean(state.supabase);
  }

  function productAvailable(product) {
    return Boolean(product.active !== false && product.visible !== false && !product.out_of_stock && Number(product.stock) > 0 && Number(product.price_cents) >= 0);
  }

  function discountPercent(product) {
    if (!product.old_price_cents || !product.price_cents) return null;
    return Math.max(0, Math.round((1 - product.price_cents / product.old_price_cents) * 100));
  }

  function currentRoute() {
    const hash = location.hash.replace(/^#/, '') || 'home';
    const [view, category] = hash.split('/');
    return { view, category };
  }

  async function initSupabase() {
    const url = runtime.supabaseUrl || '';
    const key = runtime.supabasePublishableKey || '';

    if (!url || !key || !window.supabase) {
      q('#login-mode-note').textContent = 'O catálogo está funcionando. Para login e painel, configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY nos Secrets do Replit.';
      renderUser();
      return;
    }

    state.supabase = window.supabase.createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data } = await state.supabase.auth.getSession();
    state.user = data.session?.user || null;

    if (state.user) await loadProfile();

    state.supabase.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      state.profile = null;

      if (state.user) await loadProfile();

      renderUser();

      if (state.user) await loadOrders();
    });

    q('#login-mode-note').textContent = 'Login real protegido pelo Supabase.';
    renderUser();
  }

  async function loadProfile() {
    if (!state.supabase || !state.user) return;

    const { data, error } = await state.supabase
      .from('profiles')
      .select('id,email,full_name,avatar_url,role,blocked,blocked_reason')
      .eq('id', state.user.id)
      .maybeSingle();

    if (error) console.warn('Falha ao carregar perfil:', error.message);

    state.profile = data || {
      id: state.user.id,
      email: state.user.email,
      full_name: state.user.user_metadata?.full_name || state.user.user_metadata?.name || state.user.email?.split('@')[0] || 'Cliente',
      avatar_url: state.user.user_metadata?.avatar_url || null,
      role: 'customer',
      blocked: false
    };

    if (state.profile.blocked) {
      const reason = state.profile.blocked_reason ? ` Motivo: ${state.profile.blocked_reason}` : '';
      await state.supabase.auth.signOut();
      state.user = null;
      state.profile = null;
      toast(`Seu acesso está bloqueado.${reason}`);
    }
  }

  async function login(provider) {
    if (!state.supabase) {
      toast('Configure o Supabase no Replit para ativar o login.');
      return;
    }

    const redirectTo = runtime.siteUrl || location.origin;
    const { error } = await state.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });

    if (error) toast(`Não foi possível entrar: ${error.message}`);
  }

  async function logout() {
    if (state.supabase) await state.supabase.auth.signOut();

    state.user = null;
    state.profile = null;

    renderUser();
    closeDialogs();
    toast('Você saiu da conta.');
  }

  function renderUser() {
    const button = q('.account-button[data-action="open-login"]');
    const label = state.profile?.full_name || state.user?.user_metadata?.full_name || state.user?.email?.split('@')[0] || 'Entrar';

    if (button) {
      button.innerHTML = `<span>${escapeHtml(label)}</span>`;
    }

    q('#logout-button')?.classList.toggle('hidden', !state.user);
    q('#staff-panel-link')?.classList.toggle('hidden', !isStaff());
    q('#staff-panel-top-link')?.classList.toggle('hidden', !isStaff());
  }

  async function loadCatalogData() {
    if (!state.supabase) {
      renderAllCatalogAreas();
      return;
    }

    const [categoriesResult, productsResult] = await Promise.all([
      state.supabase.from('categories').select('slug,name,sort_order,active').eq('active', true).order('sort_order'),
      state.supabase.from('products').select('*').eq('active', true).eq('visible', true).order('sort_order')
    ]);

    if (!categoriesResult.error && categoriesResult.data?.length) {
      const dbCategories = categoriesResult.data.map((item) => ({ id: item.slug, name: item.name }));
      state.categories = CATEGORY_META.map((item) => dbCategories.find((db) => db.id === item.id) || item);
    }

    if (!productsResult.error && productsResult.data?.length) {
      state.products = productsResult.data.map(normalizeProduct);
    } else if (productsResult.error) {
      console.warn('Usando catálogo local:', productsResult.error.message);
    }

    renderAllCatalogAreas();
  }

  function normalizeProduct(product) {
    return {
      ...product,
      price_cents: Number(product.price_cents ?? 0),
      old_price_cents: product.old_price_cents == null ? null : Number(product.old_price_cents),
      stock: Number(product.stock ?? 0),
      image_path: product.image_path || 'assets/logo.png'
    };
  }

  function renderSidebar() {
    q('#sailor-submenu').innerHTML = state.categories.map((category) => (
      `<button class="sidebar-item ${state.selectedCategory === category.id ? 'active' : ''}" data-category="${category.id}">${escapeHtml(category.name)}</button>`
    )).join('');
  }

  function productMatchesCategory(product, category) {
    if (category === 'novo') return Boolean(product.is_new);
    return product.category_slug === category;
  }

  function productCard(product) {
    const discount = discountPercent(product);
    const available = productAvailable(product);
    const oldPrice = product.old_price_cents ? `<div class="price-old">${formatMoney(product.old_price_cents)}</div>` : '';

    const priceFormatted = formatMoney(product.price_cents);
    const itemPropBlock = `itemprop="offers" itemscope itemtype="https://schema.org/Offer"`;
    return `<article class="product-card" data-product-card="${escapeHtml(product.id)}"
        itemscope itemtype="https://schema.org/Product"
        aria-label="${escapeHtml(product.name)} - ${priceFormatted}">
      <meta itemprop="name" content="${escapeHtml(product.name)}" />
      <meta itemprop="category" content="${escapeHtml(categoryName(product.category_slug))}" />
      <div class="product-image">
        <img src="${escapeHtml(product.image_path)}" alt="${escapeHtml(product.name)} - Sailor Piece Roblox" loading="lazy" itemprop="image" />
        ${product.is_new ? '<span class="badge" style="background:var(--blue);color:#03111a">NOVO</span>' : '<span class="badge">ENTREGA RÁPIDA</span>'}
        ${available ? '' : '<span class="stock-badge">FORA DE ESTOQUE</span>'}
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHtml(categoryName(product.category_slug))}</span>
        <h3 itemprop="name">${escapeHtml(product.name)}</h3>
        <div class="price-row" ${itemPropBlock}>
          <div>
            ${oldPrice}
            <div class="price" itemprop="price" content="${(product.price_cents/100).toFixed(2)}">${priceFormatted}</div>
            <meta itemprop="priceCurrency" content="BRL" />
          </div>
          ${discount ? `<span class="discount">${discount}% OFF</span>` : ''}
        </div>
        <div class="pix-label">⚡ À vista no PIX</div>
        <div class="product-actions">
          <button class="buy-button" data-buy="${escapeHtml(product.id)}" ${available ? '' : 'disabled'} aria-label="Comprar ${escapeHtml(product.name)}">${available ? '⚡ COMPRAR' : 'ESGOTADO'}</button>
          <button class="bag-button" data-add="${escapeHtml(product.id)}" aria-label="Adicionar ${escapeHtml(product.name)} ao carrinho" ${available ? '' : 'disabled'}>🛍</button>
        </div>
      </div>
    </article>`;
  }

  function filteredProducts() {
    let list = state.products.filter((product) => product.visible !== false && product.active !== false && productMatchesCategory(product, state.selectedCategory));
    const search = state.search.trim().toLowerCase();

    if (search) list = list.filter((product) => product.name.toLowerCase().includes(search));
    if (state.sort === 'low') list.sort((a, b) => a.price_cents - b.price_cents);
    if (state.sort === 'high') list.sort((a, b) => b.price_cents - a.price_cents);
    if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (state.sort === 'featured') list.sort((a, b) => Number(b.featured) - Number(a.featured));

    return list;
  }

  function renderCatalogProducts() {
    const category = state.categories.find((item) => item.id === state.selectedCategory) || CATEGORY_META[0];
    q('#catalog-title').textContent = category.name;
    q('#breadcrumb').textContent = `Início › Categorias › ${category.name}`;

    const list = filteredProducts();

    q('#product-grid').innerHTML = list.map(productCard).join('');
    q('#empty-products').classList.toggle('hidden', list.length > 0);

    renderSidebar();
  }

  function renderFeatured() {
    let list = state.products.filter((product) => product.visible !== false && product.active !== false && product.featured);

    if (list.length < 4) {
      list = state.products.filter((product) => product.visible !== false && product.active !== false).slice(0, 8);
    }

    q('#featured-grid').innerHTML = list.slice(0, 8).map(productCard).join('');
  }

  function renderAllCatalogAreas() {
    renderSidebar();
    renderCatalogProducts();
    renderFeatured();
  }

  function handleRoute() {
    const { view, category } = currentRoute();
    const validView = ['home', 'catalog', 'reviews'].includes(view) ? view : 'home';

    qa('.view').forEach((element) => element.classList.add('hidden'));
    q(`#${validView}-view`).classList.remove('hidden');

    if (validView === 'catalog') {
      if (category && state.categories.some((item) => item.id === category)) {
        state.selectedCategory = category;
      }

      renderCatalogProducts();
    }

    if (validView === 'reviews') renderReviewsPage();

    q('#mobile-nav').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getProduct(id) {
    return state.products.find((product) => product.id === id);
  }

  function cartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotalCents() {
    return state.cart.reduce((sum, item) => sum + (getProduct(item.id)?.price_cents || 0) * item.qty, 0);
  }

  function saveCart() {
    writeLocal('shadowblox_cart', state.cart);
    renderCart();
  }

  function addToCart(productId, openCheckout = false) {
    const product = getProduct(productId);

    if (!product || !productAvailable(product)) {
      toast('Este produto está fora de estoque.');
      return;
    }

    const item = state.cart.find((cartItem) => cartItem.id === productId);

    if (item) item.qty += 1;
    else state.cart.push({ id: productId, qty: 1 });

    saveCart();
    toast('Produto adicionado ao carrinho.');

    if (openCheckout) startCheckout();
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find((cartItem) => cartItem.id === productId);

    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
      state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
    }

    saveCart();
  }

  function renderCart() {
    q('#cart-count').textContent = String(cartCount());
    q('#cart-total').textContent = formatMoney(cartTotalCents());

    const html = state.cart.map((item) => {
      const product = getProduct(item.id);
      if (!product) return '';

      return `<article class="cart-item">
        <img src="${escapeHtml(product.image_path)}" alt="" />
        <div>
          <h4>${escapeHtml(product.name)}</h4>
          <p>${formatMoney(product.price_cents * item.qty)}</p>
          <div class="quantity">
            <button data-qty="-1" data-id="${product.id}">−</button>
            <b>${item.qty}</b>
            <button data-qty="1" data-id="${product.id}">+</button>
          </div>
        </div>
        <button class="remove-button" data-remove="${product.id}">Remover</button>
      </article>`;
    }).join('');

    q('#cart-items').innerHTML = html || '<div class="empty-state">Seu carrinho está vazio.</div>';

    renderCheckout();
  }

  function renderCheckout() {
  q('#checkout-items').innerHTML = state.cart.map((item) => {
    const product = getProduct(item.id);

    return product
      ? `<div class="checkout-mini-item"><span>${item.qty}× ${escapeHtml(product.name)}</span><span>${formatMoney(product.price_cents * item.qty)}</span></div>`
      : '';
  }).join('');

  q('#checkout-total').textContent = formatMoney(cartTotalCents());

  const pixInput = q('#pix-code');
  if (pixInput) {
    pixInput.value = pixCode;
  }

  q('#checkout-login-gate').classList.toggle('hidden', Boolean(state.user));
  q('#checkout-content').classList.toggle('hidden', !state.user);
}

  function startCheckout() {
    if (!state.cart.length) {
      toast('Adicione produtos ao carrinho.');
      return;
    }

    closeDialogs();
    renderCheckout();
    openDialog('#checkout-dialog');
  }

  async function createPixOrder() {
    if (!state.user || !state.supabase) {
      openDialog('#login-dialog');
      return;
    }

    if (!state.receiptFile) {
      toast('Anexe o comprovante do pagamento.');
      return;
    }

    const items = state.cart.map((item) => ({
      product_id: item.id,
      quantity: item.qty
    }));

    const { data: orderId, error } = await state.supabase.rpc('create_order', {
      p_payment_method: 'pix',
      p_items: items
    });

    if (error) {
      toast(`Não foi possível criar o pedido: ${error.message}`);
      return;
    }

    const safeName = state.receiptFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${state.user.id}/${orderId}/${Date.now()}-${safeName}`;

    const upload = await state.supabase.storage.from('receipts').upload(path, state.receiptFile, {
      upsert: false
    });

    if (upload.error) {
      toast(`Pedido criado, mas o comprovante falhou: ${upload.error.message}`);
      return;
    }

    const submit = await state.supabase.rpc('submit_payment_receipt', {
      p_order_id: orderId,
      p_file_path: path
    });

    if (submit.error) {
      toast(`Comprovante enviado, mas o status não foi atualizado: ${submit.error.message}`);
      return;
    }

    state.cart = [];
    state.receiptFile = null;

    saveCart();
    closeDialogs();

    toast('Pedido enviado para análise.');

    await openOrders();
  }

  async function payCard() {
    if (!state.user || !state.supabase) {
      openDialog('#login-dialog');
      return;
    }

    if (!state.cart.length) {
      toast('Adicione produtos ao carrinho.');
      return;
    }

    const button = q('[data-action="pay-card"]');

    try {
      if (button) {
        button.disabled = true;
        button.textContent = 'Gerando pagamento...';
      }

      const items = state.cart.map((item) => ({
        product_id: item.id,
        quantity: item.qty
      }));

      const { data: orderId, error: orderError } = await state.supabase.rpc('create_order', {
        p_payment_method: 'pix',
        p_items: items
      });

      if (orderError) {
        toast(`Erro ao criar pedido: ${orderError.message}`);
        return;
      }

      const { data: sessionData } = await state.supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast('Sessão expirada. Faça login novamente.');
        return;
      }

      const response = await fetch('/api/mercadopago/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        console.error(result);
        toast(result.error || 'Erro ao criar pagamento Mercado Pago.');
        return;
      }

      const panel = q('#payment-card');
      let box = q('#mp-payment-result');

      if (!box && panel) {
        box = document.createElement('div');
        box.id = 'mp-payment-result';
        box.className = 'info-box';
        panel.appendChild(box);
      }

      if (box) {
        box.innerHTML = `
          <h4>Pix Mercado Pago gerado</h4>
          <p>Escaneie o QR Code ou copie o código abaixo.</p>
          ${
            result.qrCodeBase64
              ? `<img
                  style="max-width:220px;width:100%;display:block;margin:12px auto;border-radius:12px;"
                  src="data:image/png;base64,${escapeHtml(result.qrCodeBase64)}"
                  alt="QR Code Mercado Pago"
                >`
              : ''
          }
          <textarea
            id="mp-pix-code"
            readonly
            style="width:100%;min-height:120px;"
          >${escapeHtml(result.qrCode || '')}</textarea>
          <button
            id="mp-copy-pix"
            class="secondary-button full"
            type="button"
          >
            Copiar Pix Mercado Pago
          </button>
          ${
            result.ticketUrl
              ? `<a
                  class="secondary-button full"
                  href="${escapeHtml(result.ticketUrl)}"
                  target="_blank"
                  rel="noopener"
                >
                  Abrir pagamento
                </a>`
              : ''
          }
        `;

        q('#mp-copy-pix')?.addEventListener('click', async () => {
          await navigator.clipboard.writeText(result.qrCode || '');
          toast('Pix Mercado Pago copiado.');
        });
      }

      state.cart = [];
      saveCart();
      renderCart();
      await loadOrders();

      toast('Pagamento Mercado Pago gerado.');
    } catch (error) {
      console.error(error);
      toast('Erro inesperado ao gerar Mercado Pago.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Continuar para pagamento';
      }
    }
  }

  async function loadOrders() {
    if (!state.supabase || !state.user) {
      state.orders = [];
      renderOrders();
      return;
    }

    const { data, error } = await state.supabase
      .from('orders')
      .select('*,order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(error.message);
      state.orders = [];
    } else {
      state.orders = data || [];
    }

    renderOrders();
  }

  function statusLabel(status) {
    return ({
      awaiting_payment:'Aguardando pagamento',
      under_review:'Em análise',
      paid:'Pagamento aprovado',
      rejected:'Pagamento recusado',
      in_service:'Em atendimento',
      delivered:'Entregue',
      cancelled:'Cancelado',
      refunded:'Reembolsado'
    })[status] || status;
  }

  function paymentMethodLabel(method) {
    return ({
      pix: 'Pix manual',
      mercado_pago_pix: 'Pix Mercado Pago',
      card: 'Cartão'
    })[method] || method || 'Pagamento';
  }

  function orderCard(order, dashboard = false) {
    const items = order.order_items || [];
    const names = items.map((item) => `${item.quantity}× ${item.product_name}`).join(' • ');
    const canChat = ['paid', 'in_service', 'delivered'].includes(order.status);
    const adminActions = dashboard && canManagePayments() ? `<button class="small-button approve" data-order-status="paid" data-order-id="${order.id}">Aprovar</button><button class="small-button cancel" data-order-status="rejected" data-order-id="${order.id}">Recusar</button>` : '';
    const deliveryActions = dashboard && isStaff() && ['paid', 'in_service'].includes(order.status) ? `<button class="small-button" data-claim-order="${order.id}">Assumir atendimento</button><button class="small-button approve" data-deliver-order="${order.id}">Marcar entregue</button>` : '';

    return `<article class="order-card">
      <div class="order-top">
        <div>
          <div class="order-id">#${String(order.id).slice(0, 8).toUpperCase()}</div>
          <small>${new Date(order.created_at).toLocaleString('pt-BR')}</small>
        </div>
        <span class="status ${order.status}">${statusLabel(order.status)}</span>
      </div>
      <div class="order-products">${escapeHtml(names || 'Itens do pedido')}</div>
      <div class="order-top">
        <strong>${formatMoney(order.total_cents)}</strong>
        <span>${paymentMethodLabel(order.payment_method)}</span>
      </div>
      <div class="order-actions">
        ${canChat ? `<button class="small-button" data-chat="${order.id}">Abrir chat</button>` : ''}
        ${adminActions}
        ${deliveryActions}
      </div>
    </article>`;
  }

  function renderOrders() {
    q('#orders-login-gate').classList.toggle('hidden', Boolean(state.user));
    q('#orders-list').innerHTML = state.user ? (state.orders.map((order) => orderCard(order)).join('') || '<div class="empty-state">Você ainda não possui pedidos.</div>') : '';
  }

  async function openOrders() {
    closeDialogs();

    if (state.user) await loadOrders();

    renderOrders();
    openDialog('#orders-dialog');
  }

  async function openChat(orderId) {
    if (!state.supabase || !state.user) {
      toast('Entre na sua conta para acessar o chat.');
      return;
    }

    state.chatOrderId = orderId;
    q('#chat-title').textContent = `Chat do pedido #${String(orderId).slice(0, 8).toUpperCase()}`;

    await loadChatMessages();

    subscribeChat(orderId);
    closeDialogs();
    openDialog('#chat-dialog');
  }

  async function loadChatMessages() {
    const { data, error } = await state.supabase
      .from('chat_messages')
      .select('id,order_id,sender_id,message,created_at')
      .eq('order_id', state.chatOrderId)
      .order('created_at');

    if (error) {
      toast(`Não foi possível abrir o chat: ${error.message}`);
      return;
    }

    q('#chat-messages').innerHTML = (data || []).map((message) => {
      const mine = message.sender_id === state.user.id;

      return `<div class="message ${mine ? 'mine' : ''}">
        ${escapeHtml(message.message)}
        <small>${mine ? 'Você' : 'Equipe Shadowblox'} • ${new Date(message.created_at).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</small>
      </div>`;
    }).join('') || '<div class="empty-state">Envie a primeira mensagem para receber seu item.</div>';

    q('#chat-messages').scrollTop = q('#chat-messages').scrollHeight;
  }

  function subscribeChat(orderId) {
    if (state.chatChannel) state.supabase.removeChannel(state.chatChannel);

    state.chatChannel = state.supabase.channel(`order-chat-${orderId}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `order_id=eq.${orderId}`
    }, () => loadChatMessages()).subscribe();
  }

  async function sendChatMessage(text) {
    if (!state.supabase || !state.chatOrderId || !state.user) return;

    const { error } = await state.supabase.from('chat_messages').insert({
      order_id: state.chatOrderId,
      sender_id: state.user.id,
      message: text
    });

    if (error) toast(`Mensagem não enviada: ${error.message}`);
  }

  function closeChat() {
    if (state.chatChannel && state.supabase) {
      state.supabase.removeChannel(state.chatChannel);
    }

    state.chatChannel = null;
    state.chatOrderId = null;

    q('#chat-dialog').close();
  }

  async function loadPublicReviews() {
    if (!state.supabase) {
      state.reviews = [];
      renderReviewAreas();
      return;
    }

    const { data, error } = await state.supabase.rpc('get_public_reviews');

    if (error) {
      console.warn('Avaliações:', error.message);
      state.reviews = [];
    } else {
      state.reviews = data || [];
    }

    renderReviewAreas();
  }

  function reviewCard(review, management = false) {
    const avatar = review.avatar_url || 'assets/logo.png';
    const response = review.response_message ? `<div class="review-response"><strong>Resposta da Shadowblox</strong>${escapeHtml(review.response_message)}</div>` : '';
    const controls = management && roleIn('owner', 'admin') ? `<div class="review-actions"><button class="small-button" data-review-reply="${review.id}">Responder</button><button class="small-button cancel" data-review-hide="${review.id}">${review.status === 'published' ? 'Ocultar' : 'Publicar'}</button></div>` : '';

    return `<article class="review-card">
      <div class="review-head">
        <div class="review-user">
          <img class="review-avatar" src="${escapeHtml(avatar)}" alt="" />
          <div>
            <strong>${escapeHtml(review.display_name || 'Cliente')}</strong>
            <small>${new Date(review.created_at).toLocaleDateString('pt-BR')}</small>
          </div>
        </div>
        <div class="stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</div>
      </div>
      <span class="verified">✓ COMPRA VERIFICADA</span>
      <p>${escapeHtml(review.comment)}</p>
      ${response}
      ${controls}
    </article>`;
  }

  function reviewStats() {
    const reviews = state.reviews.filter((review) => review.status === 'published' || !review.status);
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / total : 0;
    const counts = [1,2,3,4,5].reduce((map, rating) => ({ ...map, [rating]: reviews.filter((review) => Number(review.rating) === rating).length }), {});

    return { total, average, counts };
  }

  function reviewSummaryHtml() {
    const stats = reviewStats();
    const bars = [5,4,3,2,1].map((rating) => {
      const count = stats.counts[rating];
      const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;

      return `<div class="rating-row"><span>${rating} estrelas</span><div class="rating-bar"><i style="width:${percentage}%"></i></div><b>${count}</b></div>`;
    }).join('');

    return `<div class="review-score"><strong>${stats.average.toFixed(1).replace('.', ',')}</strong><div class="stars">${'★'.repeat(Math.round(stats.average))}${'☆'.repeat(5 - Math.round(stats.average))}</div><span>${stats.total} avaliações verificadas</span></div><div class="rating-bars">${bars}</div>`;
  }

  function sortedReviews() {
    const sort = q('#reviews-sort')?.value || 'newest';
    const list = [...state.reviews].filter((review) => review.status === 'published' || !review.status);

    if (sort === 'best') list.sort((a,b) => Number(b.rating) - Number(a.rating));
    else if (sort === 'worst') list.sort((a,b) => Number(a.rating) - Number(b.rating));
    else list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }

  function renderReviewAreas() {
    const summary = reviewSummaryHtml();

    q('#reviews-summary-home').innerHTML = summary;
    q('#reviews-summary').innerHTML = summary;

    const sorted = sortedReviews();

    q('#reviews-preview').innerHTML = sorted.slice(0, 3).map((review) => reviewCard(review)).join('') || '<div class="empty-state">As primeiras avaliações aparecerão aqui.</div>';
    q('#reviews-list').innerHTML = sorted.map((review) => reviewCard(review)).join('') || '<div class="empty-state">Ainda não há avaliações publicadas.</div>';
  }

  function renderReviewsPage() {
    renderReviewAreas();
  }

  async function openReviewForm() {
    closeDialogs();

    if (!state.user || !state.supabase) {
      q('#review-gate').textContent = 'Entre na sua conta para avaliar a loja.';
      q('#review-form').classList.add('hidden');
      openDialog('#review-dialog');
      return;
    }

    const { data, error } = await state.supabase.rpc('get_eligible_review_orders');

    if (error || !data?.length) {
      q('#review-gate').textContent = 'Você poderá avaliar a loja depois que um pedido for marcado como entregue.';
      q('#review-form').classList.add('hidden');
    } else {
      q('#review-gate').textContent = 'Escolha um pedido entregue. Cada pedido pode gerar uma avaliação.';
      q('#review-order').innerHTML = data.map((order) => `<option value="${order.order_id}">Pedido #${String(order.order_id).slice(0, 8).toUpperCase()} — ${new Date(order.delivered_at).toLocaleDateString('pt-BR')}</option>`).join('');
      q('#review-form').classList.remove('hidden');
      renderStarPicker();
    }

    openDialog('#review-dialog');
  }

  function renderStarPicker() {
    q('#star-picker').innerHTML = `<div class="star-picker">${[1,2,3,4,5].map((rating) => `<button class="star-button ${rating <= state.reviewRating ? 'active' : ''}" type="button" data-rating="${rating}">★</button>`).join('')}</div>`;
  }

  async function submitReview(event) {
    event.preventDefault();

    const orderId = q('#review-order').value;
    const comment = q('#review-comment').value.trim();

    if (!comment) return;

    const { error } = await state.supabase.from('store_reviews').insert({
      order_id: orderId,
      user_id: state.user.id,
      rating: state.reviewRating,
      comment
    });

    if (error) {
      toast(`Avaliação não publicada: ${error.message}`);
      return;
    }

    q('#review-comment').value = '';
    q('#review-dialog').close();

    toast('Obrigado pela sua avaliação!');

    await loadPublicReviews();
  }

  function dashboardTabs() {
    const tabs = [{ id:'overview', label:'Visão geral' }];

    if (canManageProducts()) {
      tabs.push({ id:'products', label:'Produtos e estoque' }, { id:'orders', label:'Pedidos e pagamentos' });
    }

    if (isStaff()) {
      tabs.push({ id:'delivery', label:'Atendimento e entregas' });
    }

    if (canManageTeam()) {
      tabs.push({ id:'team', label:'Equipe e permissões' });
    }

    if (roleIn('owner', 'admin')) {
      tabs.push({ id:'reviews', label:'Avaliações' });
    }

    return tabs;
  }

  async function openDashboard() {
    if (!isStaff()) {
      toast('Acesso não autorizado.');
      return;
    }

    closeDialogs();

    state.dashboardTab = dashboardTabs()[0].id;

    renderDashboardTabs();

    await renderDashboardContent();

    openDialog('#dashboard-dialog');
  }

  function renderDashboardTabs() {
    q('#dashboard-tabs').innerHTML = dashboardTabs().map((tab) => `<button class="dashboard-tab ${state.dashboardTab === tab.id ? 'active' : ''}" data-dashboard-tab="${tab.id}">${tab.label}</button>`).join('');
  }

  async function renderDashboardContent() {
    const root = q('#dashboard-content');

    root.innerHTML = '<div class="empty-state">Carregando...</div>';

    if (state.dashboardTab === 'overview') return renderDashboardOverview(root);
    if (state.dashboardTab === 'products') return renderProductsAdmin(root);
    if (state.dashboardTab === 'orders') return renderOrdersAdmin(root);
    if (state.dashboardTab === 'delivery') return renderDeliveryAdmin(root);
    if (state.dashboardTab === 'team') return renderTeamAdmin(root);
    if (state.dashboardTab === 'reviews') return renderReviewsAdmin(root);
  }

  async function renderDashboardOverview(root) {
    await loadOrders();

    const paid = state.orders.filter((order) => ['paid','in_service','delivered'].includes(order.status));
    const delivered = state.orders.filter((order) => order.status === 'delivered');

    root.innerHTML = `<div class="dashboard-grid">
      <div class="stat-card"><strong>${state.products.length}</strong><span>Produtos cadastrados</span></div>
      <div class="stat-card"><strong>${state.orders.length}</strong><span>Pedidos visíveis</span></div>
      <div class="stat-card"><strong>${paid.length}</strong><span>Pagamentos aprovados</span></div>
      <div class="stat-card"><strong>${delivered.length}</strong><span>Entregues</span></div>
    </div>
    <div class="panel-section">
      <h3>Seu acesso</h3>
      <p class="muted">Cargo: <span class="role-pill">${escapeHtml(state.profile?.role || 'customer')}</span></p>
    </div>`;
  }

  async function renderProductsAdmin(root) {
    if (!canManageProducts()) return;

    const { data, error } = await state.supabase.from('products').select('*').order('sort_order');

    if (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
      return;
    }

    const rows = (data || []).map((product) => `<tr data-admin-product="${product.id}">
      <td><img src="${escapeHtml(product.image_path)}" alt="" /></td>
      <td><input data-field="name" value="${escapeHtml(product.name)}" /></td>
      <td><select data-field="category_slug">${state.categories.map((category) => `<option value="${category.id}" ${category.id === product.category_slug ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select></td>
      <td><input data-field="price" type="number" step="0.01" min="0" value="${(Number(product.price_cents) / 100).toFixed(2)}" /></td>
      <td><input data-field="old_price" type="number" step="0.01" min="0" value="${product.old_price_cents ? (Number(product.old_price_cents) / 100).toFixed(2) : ''}" /></td>
      <td><input data-field="stock" type="number" min="0" value="${product.stock}" /></td>
      <td><span class="role-pill">${product.out_of_stock ? 'Fora de estoque' : product.visible ? 'Visível' : 'Oculto'}</span></td>
      <td>
        <div class="row-actions">
          <button class="small-button approve" data-save-product="${product.id}">Salvar</button>
          <button class="small-button" data-stock-product="${product.id}">${product.out_of_stock ? 'Disponibilizar' : 'Fora de estoque'}</button>
          <button class="small-button cancel" data-visible-product="${product.id}">${product.visible ? 'Ocultar' : 'Reativar'}</button>
        </div>
      </td>
    </tr>`).join('');

    root.innerHTML = `<div class="panel-section">
      <h3>Produtos e estoque</h3>
      <p class="muted">Fora de estoque mantém o produto visível. Ocultar remove o produto do catálogo.</p>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Preço antigo</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  async function saveProduct(productId) {
    const row = q(`[data-admin-product="${CSS.escape(productId)}"]`);

    const payload = {
      name: q('[data-field="name"]', row).value.trim(),
      category_slug: q('[data-field="category_slug"]', row).value,
      price_cents: Math.round(Number(q('[data-field="price"]', row).value || 0) * 100),
      old_price_cents: q('[data-field="old_price"]', row).value ? Math.round(Number(q('[data-field="old_price"]', row).value) * 100) : null,
      stock: Math.max(0, Number(q('[data-field="stock"]', row).value || 0)),
      updated_at: new Date().toISOString()
    };

    const { error } = await state.supabase.from('products').update(payload).eq('id', productId);

    if (error) {
      toast(error.message);
    } else {
      toast('Produto atualizado.');
      await loadCatalogData();
    }
  }

  async function toggleProductField(productId, field) {
    const current = await state.supabase.from('products').select(field).eq('id', productId).single();

    if (current.error) {
      toast(current.error.message);
      return;
    }

    const value = !Boolean(current.data[field]);

    const { error } = await state.supabase.from('products').update({
      [field]: value,
      updated_at: new Date().toISOString()
    }).eq('id', productId);

    if (error) {
      toast(error.message);
    } else {
      toast('Status atualizado.');
      await loadCatalogData();
      await renderProductsAdmin(q('#dashboard-content'));
    }
  }

  async function renderOrdersAdmin(root) {
    await loadOrders();

    root.innerHTML = `<div class="panel-section">
      <h3>Pedidos e pagamentos</h3>
      <div class="orders-list">${state.orders.map((order) => orderCard(order, true)).join('') || '<div class="empty-state">Nenhum pedido.</div>'}</div>
    </div>`;
  }

  async function changeOrderStatus(orderId, status) {
    const { error } = await state.supabase.rpc('set_order_status', {
      p_order_id: orderId,
      p_status: status
    });

    if (error) {
      toast(error.message);
    } else {
      toast(`Pedido: ${statusLabel(status)}.`);
      await renderDashboardContent();
    }
  }

  async function renderDeliveryAdmin(root) {
    await loadOrders();

    const orders = state.orders.filter((order) => ['paid','in_service','delivered'].includes(order.status));

    root.innerHTML = `<div class="panel-section">
      <h3>Atendimento e entregas</h3>
      <p class="muted">Funcionários podem assumir pedidos pagos, conversar com o cliente e marcar como entregue.</p>
      <div class="orders-list">${orders.map((order) => orderCard(order, true)).join('') || '<div class="empty-state">Nenhum pedido disponível.</div>'}</div>
    </div>`;
  }

  async function claimOrder(orderId) {
    const { error } = await state.supabase.rpc('claim_order', {
      p_order_id: orderId
    });

    if (error) {
      toast(error.message);
    } else {
      toast('Atendimento assumido.');
      await renderDashboardContent();
    }
  }

  async function deliverOrder(orderId) {
    const { error } = await state.supabase.rpc('mark_order_delivered', {
      p_order_id: orderId
    });

    if (error) {
      toast(error.message);
    } else {
      toast('Pedido marcado como entregue.');
      await renderDashboardContent();
    }
  }

  async function renderTeamAdmin(root) {
    if (!canManageTeam()) return;

    const { data, error } = await state.supabase
      .from('profiles')
      .select('id,email,full_name,role,blocked,blocked_reason,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
      return;
    }

    const rows = (data || []).map((profile) => `<tr>
      <td>${escapeHtml(profile.full_name || 'Sem nome')}</td>
      <td>${escapeHtml(profile.email || '')}</td>
      <td><span class="role-pill">${escapeHtml(profile.role)}</span></td>
      <td>${profile.blocked ? '<span class="role-pill blocked-pill">Bloqueado</span>' : 'Ativo'}</td>
      <td>
        <div class="row-actions">
          ${profile.role !== 'owner' ? `<button class="small-button" data-set-role="admin" data-user-id="${profile.id}">Admin</button><button class="small-button" data-set-role="delivery_staff" data-user-id="${profile.id}">Entregador</button><button class="small-button" data-set-role="customer" data-user-id="${profile.id}">Cliente</button><button class="small-button cancel" data-block-user="${profile.id}" data-blocked="${profile.blocked ? 'false' : 'true'}">${profile.blocked ? 'Desbloquear' : 'Bloquear'}</button>` : '<span class="muted">Proprietário protegido</span>'}
        </div>
      </td>
    </tr>`).join('');

    root.innerHTML = `<div class="panel-section">
      <h3>Equipe e permissões</h3>
      <p class="muted">Somente o proprietário pode alterar cargos ou bloquear contas.</p>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  async function setUserRole(userId, role) {
    if (!confirm(`Alterar o cargo deste usuário para ${role}?`)) return;

    const { error } = await state.supabase.rpc('set_user_role', {
      p_user_id: userId,
      p_role: role
    });

    if (error) {
      toast(error.message);
    } else {
      toast('Cargo atualizado.');
      await renderDashboardContent();
    }
  }

  async function setUserBlocked(userId, blocked) {
    let reason = null;

    if (blocked) {
      reason = prompt('Motivo do bloqueio:') || 'Bloqueado pelo proprietário';
    }

    if (!confirm(blocked ? 'Bloquear este usuário?' : 'Desbloquear este usuário?')) return;

    const { error } = await state.supabase.rpc('set_user_blocked', {
      p_user_id: userId,
      p_blocked: blocked,
      p_reason: reason
    });

    if (error) {
      toast(error.message);
    } else {
      toast(blocked ? 'Usuário bloqueado.' : 'Usuário desbloqueado.');
      await renderDashboardContent();
    }
  }

  async function renderReviewsAdmin(root) {
    const { data, error } = await state.supabase
      .from('store_reviews')
      .select('id,rating,comment,status,created_at,user_id,profiles(full_name,email)')
      .order('created_at', { ascending: false });

    if (error) {
      root.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
      return;
    }

    const normalized = (data || []).map((review) => ({
      ...review,
      display_name: review.profiles?.full_name || review.profiles?.email || 'Cliente'
    }));

    root.innerHTML = `<div class="panel-section">
      <h3>Moderação de avaliações</h3>
      <div class="reviews-grid reviews-grid-full">${normalized.map((review) => reviewCard(review, true)).join('') || '<div class="empty-state">Nenhuma avaliação.</div>'}</div>
    </div>`;
  }

  async function replyReview(reviewId) {
    const message = prompt('Digite a resposta pública da Shadowblox:');

    if (!message?.trim()) return;

    const { error } = await state.supabase.rpc('respond_to_review', {
      p_review_id: reviewId,
      p_message: message.trim()
    });

    if (error) {
      toast(error.message);
    } else {
      toast('Resposta publicada.');
      await loadPublicReviews();
      await renderDashboardContent();
    }
  }

  async function toggleReviewVisibility(reviewId) {
    const reason = prompt('Informe o motivo da moderação:') || 'Moderação administrativa';

    const { error } = await state.supabase.rpc('toggle_review_visibility', {
      p_review_id: reviewId,
      p_reason: reason
    });

    if (error) {
      toast(error.message);
    } else {
      toast('Avaliação atualizada.');
      await loadPublicReviews();
      await renderDashboardContent();
    }
  }

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button,a,[data-action],[data-route]');

    if (!target) return;

    if (target.dataset.route) {
      event.preventDefault();
      location.hash = target.getAttribute('href') || `#${target.dataset.route}`;
    }

    if (target.dataset.category) {
      state.selectedCategory = target.dataset.category;
      location.hash = `#catalog/${state.selectedCategory}`;
      q('.catalog-sidebar').classList.remove('open');
    }

    if (target.dataset.add) addToCart(target.dataset.add);
    if (target.dataset.buy) addToCart(target.dataset.buy, true);
    if (target.dataset.qty) updateCartQty(target.dataset.id, Number(target.dataset.qty));
    if (target.dataset.remove) {
      state.cart = state.cart.filter((item) => item.id !== target.dataset.remove);
      saveCart();
    }

    if (target.dataset.provider) login(target.dataset.provider);
    if (target.dataset.chat) openChat(target.dataset.chat);
    if (target.dataset.rating) {
      state.reviewRating = Number(target.dataset.rating);
      renderStarPicker();
    }

    if (target.dataset.dashboardTab) {
      state.dashboardTab = target.dataset.dashboardTab;
      renderDashboardTabs();
      await renderDashboardContent();
    }

    if (target.dataset.saveProduct) await saveProduct(target.dataset.saveProduct);
    if (target.dataset.stockProduct) await toggleProductField(target.dataset.stockProduct, 'out_of_stock');
    if (target.dataset.visibleProduct) await toggleProductField(target.dataset.visibleProduct, 'visible');
    if (target.dataset.orderStatus) await changeOrderStatus(target.dataset.orderId, target.dataset.orderStatus);
    if (target.dataset.claimOrder) await claimOrder(target.dataset.claimOrder);
    if (target.dataset.deliverOrder) await deliverOrder(target.dataset.deliverOrder);
    if (target.dataset.setRole) await setUserRole(target.dataset.userId, target.dataset.setRole);
    if (target.dataset.blockUser) await setUserBlocked(target.dataset.blockUser, target.dataset.blocked === 'true');
    if (target.dataset.reviewReply) await replyReview(target.dataset.reviewReply);
    if (target.dataset.reviewHide) await toggleReviewVisibility(target.dataset.reviewHide);

    switch (target.dataset.action) {
      case 'toggle-mobile-nav':
        q('#mobile-nav').classList.toggle('hidden');
        break;

      case 'focus-search':
        location.hash = '#catalog';
        setTimeout(() => q('#product-search')?.focus(), 100);
        break;

      case 'open-cart':
        renderCart();
        openDialog('#cart-dialog');
        break;

      case 'open-login':
        closeDialogs();
        openDialog('#login-dialog');
        break;

      case 'logout':
        await logout();
        break;

      case 'open-orders':
        await openOrders();
        break;

      case 'close-dialog':
        target.closest('dialog')?.close();
        break;

      case 'close-chat':
        closeChat();
        break;

      case 'start-checkout':
        startCheckout();
        break;

      case 'copy-pix':
        await navigator.clipboard.writeText(pixCode);
        toast('Código Pix copiado.');
        break;

      case 'submit-pix':
        await createPixOrder();
        break;

      case 'pay-card':
        await payCard();
        break;

      case 'toggle-sailor-menu':
        target.classList.toggle('open');
        q('#sailor-submenu').classList.toggle('collapsed');
        break;

      case 'toggle-catalog-sidebar':
        q('.catalog-sidebar').classList.toggle('open');
        break;

      case 'open-review-form':
        await openReviewForm();
        break;

      case 'open-dashboard':
        await openDashboard();
        break;
    }
  });

  q('#product-search').addEventListener('input', (event) => {
    state.search = event.target.value;
    q('#sidebar-search').value = event.target.value;
    renderCatalogProducts();
  });

  q('#sidebar-search').addEventListener('input', (event) => {
    state.search = event.target.value;
    q('#product-search').value = event.target.value;
    renderCatalogProducts();
  });

  q('#sort-filter').addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderCatalogProducts();
  });

  q('#reviews-sort').addEventListener('change', renderReviewsPage);

  const receiptInput = q('#receipt-input');

if (receiptInput) {
  receiptInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast('Envie um arquivo de até 10 MB.');
      event.target.value = '';
      return;
    }

    state.receiptFile = file;

    const receiptName = q('#receipt-name');
    if (receiptName) {
      receiptName.textContent = `Arquivo selecionado: ${file.name}`;
    }
  });
}

  q('#chat-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = q('#chat-input');
    const text = input.value.trim();

    if (!text) return;

    await sendChatMessage(text);

    input.value = '';
  });

  q('#review-form').addEventListener('submit', submitReview);

  qa('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  }));

  window.addEventListener('hashchange', handleRoute);

  async function init() {
    q('#year').textContent = new Date().getFullYear();

    renderCart();
    renderStarPicker();
    handleRoute();

    await initSupabase();
    await loadCatalogData();
    await loadPublicReviews();

    if (state.user) await loadOrders();
  }

  init().catch((error) => {
    console.error(error);
    toast('O site encontrou um erro ao iniciar. Atualize a página.');
  });
})();