import { supabase } from './supabase';

export const CATEGORY_ORDER = ['主食', '荤菜', '素菜', '汤类', '饮料'];

function requireSupabase() {
  if (!supabase) {
    throw new Error('未配置 Supabase，请先在 .env 填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  }
  return supabase;
}

export async function fetchMenu() {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('menu')
    .select('*')
    .order('sort', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createOrder(payload) {
  const sb = requireSupabase();
  const orderId = globalThis.crypto?.randomUUID?.() || `order-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const { error } = await sb
    .from('orders')
    .insert({
      ...payload,
      id: orderId,
      created_at: createdAt
    });

  if (error) throw error;
  return {
    id: orderId,
    created_at: createdAt
  };
}
