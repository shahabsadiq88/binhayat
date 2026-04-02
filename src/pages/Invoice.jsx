import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSaleById } from '../services/sales';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSaleById(id)
      .then(setSale)
      .catch(() => navigate('/sales-history'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!sale) return null;

  const saleDate = new Date(sale.sale_date);

  return (
    <>
      <div className="page-header no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-title">Invoice</h2>
          <p className="page-subtitle">{sale.invoice_number}</p>
        </div>
        <div className="flex gap-3 no-print">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Invoice</button>
        </div>
      </div>

      <div className="page-body">
        <div className="invoice-container invoice-print">
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-meta">
              <div>
                <h1>BIN HAYAT</h1>
                <p>Electric Store · Karachi, Pakistan</p>
                <p style={{ marginTop: '6px', fontSize: '12px' }}>⚡ Your Trusted Electrical Shop</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-number">INVOICE</div>
                <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px' }}>{sale.invoice_number}</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  {saleDate.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '12px' }}>
                  {saleDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="invoice-body">
            {/* Customer / Bill To */}
            {(sale.customer_name || sale.customer_phone) && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Bill To</div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{sale.customer_name || 'Walk-in Customer'}</div>
                {sale.customer_phone && <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{sale.customer_phone}</div>}
              </div>
            )}

            {/* Items Table */}
            <div className="table-wrapper invoice-items-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.sale_items?.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td className="font-semibold">{item.product_name}</td>
                      <td style={{ textAlign: 'right' }}>Rs {Number(item.unit_price).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>Rs {Number(item.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="invoice-totals">
              <div className="invoice-totals-inner">
                <div className="invoice-total-row">
                  <span>Subtotal</span>
                  <span>Rs {(Number(sale.total_amount) + Number(sale.discount)).toLocaleString()}</span>
                </div>
                {Number(sale.discount) > 0 && (
                  <div className="invoice-total-row" style={{ color: 'var(--green-light)' }}>
                    <span>Discount</span>
                    <span>– Rs {Number(sale.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="invoice-total-row">
                  <span>Payment</span>
                  <span style={{ textTransform: 'capitalize' }}>{sale.payment_method}</span>
                </div>
                <div className="invoice-total-row">
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent-light)' }}>Rs {Number(sale.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {sale.notes && (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Notes:</strong> {sale.notes}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p>Thank you for shopping at <strong>BIN HAYAT Electric Store</strong>!</p>
            <p style={{ marginTop: '4px' }}>Visit us again · Keep this invoice for warranty claims</p>
          </div>
        </div>
      </div>
    </>
  );
}
