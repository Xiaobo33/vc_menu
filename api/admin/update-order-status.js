import { createClient } from '@supabase/supabase-js';

const ALLOWED = new Set(['NEW', 'COOKING', 'DONE']);

function authorized(req) {
  const token = req.headers['x-admin-token'];
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, status } = req.body || {};
  if (!orderId || !ALLOWED.has(status)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await sb
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('id,status')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ order: data });
}
