require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT || 5000);

const isProduction = process.env.NODE_ENV === 'production';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const mercadoPagoAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const mercadoPagoWebhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
const publicSiteUrl = process.env.PUBLIC_SITE_URL || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.replace('Bearer ', '').trim();
}

async function getLoggedUser(req) {
  const token = getBearerToken(req);

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getMercadoPagoSignatureParts(signatureHeader) {
  const parts = {};

  if (!signatureHeader) {
    return parts;
  }

  signatureHeader.split(',').forEach((part) => {
    const [key, value] = part.split('=').map((item) => item.trim());
    if (key && value) {
      parts[key] = value;
    }
  });

  return parts;
}

function validateMercadoPagoSignature(req, paymentId) {
  if (!mercadoPagoWebhookSecret) {
    return !isProduction;
  }

  const signatureHeader = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];

  const { ts, v1 } = getMercadoPagoSignatureParts(signatureHeader);

  if (!paymentId || !requestId || !ts || !v1) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;

  const expected = crypto
    .createHmac('sha256', mercadoPagoWebhookSecret)
    .update(manifest)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(v1, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function approveOrderFromMercadoPago(orderId) {
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id,status,stock_deducted,user_id')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Pedido não encontrado');
  }

  if (order.status === 'paid') {
    return;
  }

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('product_id,quantity')
    .eq('order_id', orderId);

  if (itemsError) {
    throw new Error('Erro ao buscar itens do pedido');
  }

  if (!order.stock_deducted) {
    for (const item of items || []) {
      if (!item.product_id) continue;

      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id,stock,name')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        throw new Error('Produto do pedido não encontrado');
      }

      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }

      const newStock = product.stock - item.quantity;

      const { error: updateProductError } = await supabaseAdmin
        .from('products')
        .update({
          stock: newStock,
          out_of_stock: newStock <= 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateProductError) {
        throw new Error('Erro ao baixar estoque');
      }
    }
  }

  const { error: updateOrderError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'paid',
      stock_deducted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (updateOrderError) {
    throw new Error('Erro ao aprovar pedido');
  }

  const { data: existingChat } = await supabaseAdmin
    .from('chat_messages')
    .select('id')
    .eq('order_id', orderId)
    .limit(1);

  if (!existingChat || existingChat.length === 0) {
    await supabaseAdmin
      .from('chat_messages')
      .insert({
        order_id: orderId,
        sender_id: order.user_id,
        message: 'Pagamento aprovado! Mande uma mensagem para receber o item.'
      });
  }
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'shadowblox',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/config-runtime.js', (_req, res) => {
  const publicConfig = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    pixCode: process.env.PIX_COPY_PASTE_CODE || ''
  };

  res.setHeader('Cache-Control', 'no-store');
  res.type('application/javascript').send(
    `window.SHADOWBLOX_RUNTIME=${JSON.stringify(publicConfig)};`
  );
});

/**
 * Cria pagamento Pix dinâmico no Mercado Pago.
 * O frontend deve enviar:
 * {
 *   "orderId": "uuid-do-pedido"
 * }
 */
app.post('/api/mercadopago/create-payment', async (req, res) => {
  try {
    if (!mercadoPagoAccessToken) {
      return res.status(500).json({
        ok: false,
        error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado no .env'
      });
    }

    const user = await getLoggedUser(req);

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: 'Faça login para pagar'
      });
    }

    const { orderId } = req.body || {};

    if (!orderId || !isValidUuid(orderId)) {
      return res.status(400).json({
        ok: false,
        error: 'orderId inválido'
      });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        total_cents,
        customer_email,
        customer_name,
        order_items (
          quantity,
          unit_price_cents,
          product_name
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        ok: false,
        error: 'Pedido não encontrado'
      });
    }

    if (order.user_id !== user.id) {
      return res.status(403).json({
        ok: false,
        error: 'Esse pedido não pertence ao usuário logado'
      });
    }

    if (!['awaiting_payment', 'under_review'].includes(order.status)) {
      return res.status(400).json({
        ok: false,
        error: 'Esse pedido não aceita pagamento agora'
      });
    }

    const items = order.order_items || [];

    if (items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Pedido sem itens'
      });
    }

    const totalCents = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unit_price_cents));
    }, 0);

    if (totalCents <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Total inválido'
      });
    }

    await supabaseAdmin
      .from('orders')
      .update({
        total_cents: totalCents,
        payment_method: 'mercado_pago_pix',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    const paymentPayload = {
      transaction_amount: Number((totalCents / 100).toFixed(2)),
      description: `Pedido Shadowblox ${orderId}`,
      payment_method_id: 'pix',
      payer: {
        email: user.email || order.customer_email
      },
      external_reference: orderId,
      metadata: {
        order_id: orderId
      }
    };

    if (publicSiteUrl) {
      paymentPayload.notification_url = `${publicSiteUrl}/api/mercadopago/webhook`;
    }

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `shadowblox-${orderId}-pix`
      },
      body: JSON.stringify(paymentPayload)
    });

    const payment = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      return res.status(400).json({
        ok: false,
        error: 'Erro ao criar pagamento no Mercado Pago',
        details: payment
      });
    }

    return res.json({
      ok: true,
      paymentId: payment.id,
      status: payment.status,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code || '',
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || '',
      ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url || ''
    });
  } catch (error) {
    console.error('Erro em /api/mercadopago/create-payment:', error);

    return res.status(500).json({
      ok: false,
      error: 'Erro interno ao criar pagamento'
    });
  }
});

/**
 * Webhook Mercado Pago.
 * Em localhost o Mercado Pago não consegue chamar essa rota.
 * Para testar webhook, precisa publicar no Replit ou usar URL pública.
 */
app.post('/api/mercadopago/webhook', async (req, res) => {
  try {
    if (!mercadoPagoAccessToken) {
      return res.sendStatus(200);
    }

    const paymentId =
      req.query?.['data.id'] ||
      req.body?.data?.id ||
      req.body?.id;

    if (!paymentId) {
      return res.sendStatus(200);
    }

    const signatureOk = validateMercadoPagoSignature(req, String(paymentId));

    if (!signatureOk) {
      return res.status(401).json({
        ok: false,
        error: 'Assinatura do webhook inválida'
      });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mercadoPagoAccessToken}`
      }
    });

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('Erro ao buscar pagamento Mercado Pago:', payment);
      return res.sendStatus(200);
    }

    const orderId = payment.external_reference || payment.metadata?.order_id;

    if (!orderId || !isValidUuid(orderId)) {
      return res.sendStatus(200);
    }

    if (payment.status === 'approved') {
      await approveOrderFromMercadoPago(orderId);
    }

    if (['rejected', 'cancelled'].includes(payment.status)) {
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .neq('status', 'paid');
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Erro em /api/mercadopago/webhook:', error);
    return res.sendStatus(200);
  }
});

app.use(express.static(__dirname, {
  etag: true,
  maxAge: isProduction ? '1h' : 0
}));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shadowblox rodando na porta ${PORT}`);
});