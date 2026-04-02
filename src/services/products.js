import { supabase } from '../config/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getLowStockProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .filter('quantity', 'lte', supabase.rpc)
    .order('quantity');
  if (error) throw error;
  // Filter client-side for low_stock_threshold
  return data.filter((p) => p.quantity <= p.low_stock_threshold);
}

export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...product, updated_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function decrementStock(id, qty) {
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;

  const newQty = Math.max(0, product.quantity - qty);
  const { error } = await supabase
    .from('products')
    .update({ quantity: newQty, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
