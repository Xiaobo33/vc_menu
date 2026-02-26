import { createClient } from '@supabase/supabase-js';

function authorized(req) {
  const token = req.headers['x-admin-token'];
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await sb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ orders: data });
}
