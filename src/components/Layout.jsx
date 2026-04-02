import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getProducts } from '../services/products';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/inventory', icon: '📦', label: 'Inventory' },
  { to: '/new-sale', icon: '🛒', label: 'New Sale' },
  { to: '/sales-history', icon: '📋', label: 'Sales History' },
  { to: '/reports', icon: '📈', label: 'Reports' },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const low = products.filter((p) => p.quantity <= p.low_stock_threshold);
        setLowStockCount(low.length);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <h1>BIN HAYAT</h1>
          <span>Electric Store</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Inventory' && lowStockCount > 0 && (
                <span className="nav-badge">{lowStockCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
