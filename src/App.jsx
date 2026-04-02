import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import NewSale from './pages/NewSale';
import Invoice from './pages/Invoice';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/new-sale"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewSale />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/invoice/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Invoice />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sales-history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
