import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

// Public Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Investor Protected Pages
import DashboardPage from './pages/DashboardPage';
import StocksPage from './pages/StocksPage';
import StockDetailPage from './pages/StockDetailPage';
import OrdersPage from './pages/OrdersPage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';

// Admin Protected Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStocksPage from './pages/admin/AdminStocksPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminTradesPage from './pages/admin/AdminTradesPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Investor Trading Platform */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
              <Route path="/stocks/:id" element={<ProtectedRoute><StockDetailPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin Portal */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/stocks" element={<AdminRoute><AdminStocksPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/trades" element={<AdminRoute><AdminTradesPage /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer style={{
            textAlign: 'center',
            padding: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            Virtual Stock Exchange &amp; Trading System &bull; SESD College Project &bull; Strictly Simulated Demo Money (₹10,00,000 Starting Balance)
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
