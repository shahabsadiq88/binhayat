import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getProducts()
      .then((products) => {
        const low = products.filter((p) => p.quantity <= p.low_stock_threshold);
        setLowStockCount(low.length);
      })
      .catch(() => {});
  }, []);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar no-print${sidebarOpen ? ' sidebar-open' : ''}`}>
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

      <div className="main-wrapper">
        {/* Mobile top bar */}
        <header className="mobile-topbar no-print">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-icon${sidebarOpen ? ' open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
          <div className="mobile-topbar-title">
            <span>⚡</span> BIN HAYAT
          </div>
          <div style={{ width: 40 }} />
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
