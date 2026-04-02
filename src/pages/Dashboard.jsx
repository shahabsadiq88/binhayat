import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/products';
import { getDailySales } from '../services/sales';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [todaysSales, setTodaysSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, sales] = await Promise.all([
          getProducts(),
          getDailySales(new Date()),
        ]);
        setProducts(prods);
        setTodaysSales(sales);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lowStock = products.filter((p) => p.quantity <= p.low_stock_threshold);
  const todayRevenue = todaysSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const todayCount = todaysSales.length;
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card amber">
            <span className="stat-icon">💰</span>
            <div className="stat-value">Rs {todayRevenue.toLocaleString()}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
          <div className="stat-card blue">
            <span className="stat-icon">🧾</span>
            <div className="stat-value">{todayCount}</div>
            <div className="stat-label">Today's Sales</div>
          </div>
          <div className="stat-card green">
            <span className="stat-icon">📦</span>
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card red">
            <span className="stat-icon">⚠️</span>
            <div className="stat-value">{lowStock.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card purple">
            <span className="stat-icon">🚫</span>
            <div className="stat-value">{outOfStock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Link to="/new-sale" className="btn btn-primary btn-lg">
            🛒 New Sale
          </Link>
          <Link to="/inventory" className="btn btn-secondary btn-lg">
            📦 Manage Inventory
          </Link>
          <Link to="/reports" className="btn btn-secondary btn-lg">
            📈 View Reports
          </Link>
        </div>

        {/* Low Stock Warnings */}
        {lowStock.length > 0 && (
          <div className="mb-6">
            <div className="section-title" style={{ color: 'var(--red-light)' }}>
              ⚠️ Low Stock Alerts ({lowStock.length})
            </div>
            <div className="low-stock-grid">
              {lowStock.map((p) => (
                <div key={p.id} className="low-stock-card">
                  <span className="icon">⚡</span>
                  <div className="info">
                    <div className="name">{p.name}</div>
                    <div className="qty">
                      {p.quantity === 0
                        ? '🚫 Out of stock'
                        : `Only ${p.quantity} ${p.unit || 'pcs'} left`}
                    </div>
                  </div>
                  <Link to="/inventory">
                    <button className="btn btn-sm btn-secondary">Restock</button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sales */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="section-title" style={{ marginBottom: 0 }}>Today's Sales</div>
            <Link to="/sales-history" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {todaysSales.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🧾</div>
                <h3>No sales today</h3>
                <p>Create your first sale for today</p>
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Time</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="text-accent font-semibold">{sale.invoice_number}</td>
                      <td>{sale.customer_name || <span className="text-muted">Walk-in</span>}</td>
                      <td>{sale.sale_items?.length || 0}</td>
                      <td className="font-bold">Rs {Number(sale.total_amount).toLocaleString()}</td>
                      <td className="text-sm text-muted">
                        {new Date(sale.sale_date).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className={`badge ${sale.payment_method === 'cash' ? 'badge-green' : 'badge-blue'}`}>
                          {sale.payment_method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
