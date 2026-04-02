import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalesHistory } from '../services/sales';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSalesHistory()
      .then((data) => { setSales(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(sales); return; }
    const q = search.toLowerCase();
    setFiltered(sales.filter((s) =>
      s.invoice_number.toLowerCase().includes(q) ||
      (s.customer_name || '').toLowerCase().includes(q) ||
      (s.customer_phone || '').includes(q)
    ));
  }, [search, sales]);

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Sales History</h2>
        <p className="page-subtitle">{filtered.length} records</p>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by invoice #, customer name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No sales found</h3>
            <p>Start making sales to see history here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr key={sale.id}>
                    <td className="text-accent font-semibold">{sale.invoice_number}</td>
                    <td className="text-sm text-muted">
                      {new Date(sale.sale_date).toLocaleDateString('en-PK')}{' '}
                      {new Date(sale.sale_date).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{sale.customer_name || <span className="text-muted">Walk-in</span>}</td>
                    <td className="text-secondary">{sale.sale_items?.length || 0}</td>
                    <td className="text-green">
                      {Number(sale.discount) > 0 ? `Rs ${Number(sale.discount).toLocaleString()}` : '—'}
                    </td>
                    <td className="font-bold text-accent">Rs {Number(sale.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${sale.payment_method === 'cash' ? 'badge-green' : sale.payment_method === 'credit' ? 'badge-amber' : 'badge-blue'}`}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/invoice/${sale.id}`)}
                      >
                        🧾 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
