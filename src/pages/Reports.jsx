import { useEffect, useState } from 'react';
import { getDailySales, getWeeklySales, getMonthlySales } from '../services/sales';
import { useToast } from '../components/Toast';

export default function Reports() {
  const [type, setType] = useState('daily'); // daily, weekly, monthly
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      let data = [];
      const now = new Date();
      if (type === 'daily') {
        data = await getDailySales(now);
      } else if (type === 'weekly') {
        // Start of current week (Sunday)
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        data = await getWeeklySales(start);
      } else if (type === 'monthly') {
        data = await getMonthlySales(now.getFullYear(), now.getMonth() + 1);
      }
      setSales(data);
    } catch (error) {
      toast('Failed to load report data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [type]);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalSales = sales.length;
  const totalItems = sales.reduce((sum, s) => sum + (s.sale_items?.length || 0), 0);
  const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount || 0), 0);

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Sales Reports</h2>
        <p className="page-subtitle">Analyze your business performance</p>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="tabs">
            <button className={`tab ${type === 'daily' ? 'active' : ''}`} onClick={() => setType('daily')}>Daily</button>
            <button className={`tab ${type === 'weekly' ? 'active' : ''}`} onClick={() => setType('weekly')}>Weekly</button>
            <button className={`tab ${type === 'monthly' ? 'active' : ''}`} onClick={() => setType('monthly')}>Monthly</button>
          </div>
          <button className="btn btn-secondary no-print" onClick={() => window.print()} style={{ marginLeft: 'auto' }}>
            🖨️ Print Report
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card amber">
                <span className="stat-icon">💰</span>
                <div className="stat-value">Rs {totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card blue">
                <span className="stat-icon">🧾</span>
                <div className="stat-value">{totalSales}</div>
                <div className="stat-label">Total Sales</div>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">🛒</span>
                <div className="stat-value">{totalItems}</div>
                <div className="stat-label">Items Sold</div>
              </div>
              <div className="stat-card purple">
                <span className="stat-icon">📉</span>
                <div className="stat-value">Rs {totalDiscount.toLocaleString()}</div>
                <div className="stat-label">Total Discounts</div>
              </div>
            </div>

            <div className="section-title">Sales Summary</div>
            {sales.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">📈</div>
                  <h3>No sales found for this period</h3>
                  <p>Change the filter to see other records.</p>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Subtotal</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.sale_date).toLocaleDateString('en-PK')}</td>
                        <td className="text-accent font-semibold">{sale.invoice_number}</td>
                        <td>{sale.customer_name || 'Walk-in'}</td>
                        <td>{sale.sale_items?.length || 0}</td>
                        <td>Rs {(Number(sale.total_amount) + Number(sale.discount)).toLocaleString()}</td>
                        <td className="text-red">Rs {Number(sale.discount).toLocaleString()}</td>
                        <td className="font-bold">Rs {Number(sale.total_amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
