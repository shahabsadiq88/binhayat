import { supabase } from '../config/supabase';
import { decrementStock } from './products';

function generateInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${date}-${rand}`;
}

export async function createSale(saleData, items) {
  const invoiceNumber = generateInvoiceNumber();

  // Insert sale record
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert([
      {
        invoice_number: invoiceNumber,
        customer_name: saleData.customerName || null,
        customer_phone: saleData.customerPhone || null,
        total_amount: saleData.totalAmount,
        discount: saleData.discount || 0,
        paid_amount: saleData.paidAmount,
        payment_method: saleData.paymentMethod || 'cash',
        notes: saleData.notes || null,
        sale_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (saleError) throw saleError;

  // Insert sale items
  const saleItems = items.map((item) => ({
    sale_id: sale.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.quantity * item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems);
  if (itemsError) throw itemsError;

  // Decrement stock for each item
  for (const item of items) {
    await decrementStock(item.productId, item.quantity);
  }

  return sale;
}

export async function getSalesHistory() {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .order('sale_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSaleById(id) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getDailySales(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .gte('sale_date', start.toISOString())
    .lte('sale_date', end.toISOString())
    .order('sale_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWeeklySales(startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .gte('sale_date', start.toISOString())
    .lte('sale_date', end.toISOString())
    .order('sale_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMonthlySales(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .gte('sale_date', start.toISOString())
    .lte('sale_date', end.toISOString())
    .order('sale_date', { ascending: false });
  if (error) throw error;
  return data;
}
