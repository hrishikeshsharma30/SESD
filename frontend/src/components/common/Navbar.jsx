import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  Wallet, 
  LayoutDashboard, 
  LineChart, 
  ListOrdered, 
  Briefcase, 
  History, 
  Bookmark, 
  ShieldCheck, 
  LogOut, 
  User 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#fff' }}>
          <div style={{
            backgroundColor: 'var(--bull-green-bg)',
            color: 'var(--bull-green)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>
              VIRTUAL<span style={{ color: 'var(--bull-green)' }}>EXCHANGE</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SESD Simulation
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/dashboard') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link to="/stocks" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/stocks') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/stocks') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <LineChart size={16} /> Stocks
            </Link>

            <Link to="/orders" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/orders') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/orders') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <ListOrdered size={16} /> Orders
            </Link>

            <Link to="/portfolio" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/portfolio') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/portfolio') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <Briefcase size={16} /> Portfolio
            </Link>

            <Link to="/transactions" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/transactions') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/transactions') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <History size={16} /> History
            </Link>

            <Link to="/watchlist" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: isActive('/watchlist') ? '#fff' : 'var(--text-secondary)',
              backgroundColor: isActive('/watchlist') ? 'var(--bg-tertiary)' : 'transparent'
            }}>
              <Bookmark size={16} /> Watchlist
            </Link>

            {isAdmin && (
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.12)'
              }}>
                <ShieldCheck size={16} /> Admin Panel
              </Link>
            )}
          </div>
        )}

        {/* User Balance & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              {/* Virtual Balance Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-primary)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <Wallet size={16} style={{ color: 'var(--bull-green)' }} />
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Virtual Cash</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--bull-green)', fontFamily: 'var(--font-mono)' }}>
                    ₹{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* User profile & Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/profile" title="View Profile" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}>
                  <User size={15} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>

                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-success">Register (₹10L Bonus)</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
