import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, AlertCircle, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bull-green-bg)',
            color: 'var(--bull-green)',
            padding: '0.625rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem'
          }}>
            <TrendingUp size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Login to your Virtual Stock Exchange account
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Panel */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--gold-accent)', fontWeight: '600', marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Quick-Fill Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillCredentials('investor@exchange.com', 'User@123')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
            >
              Demo Investor (₹10L)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('trader2@exchange.com', 'Trader@123')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
            >
              Demo Trader 2
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@exchange.com', 'Admin@123')}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--gold-accent)' }}
            >
              Admin Panel
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--bear-red-bg)',
            color: 'var(--bear-red)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. investor@exchange.com"
              required
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <LogIn size={18} /> {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '600', color: 'var(--bull-green)' }}>
            Register &amp; Claim ₹10,00,000
          </Link>
        </div>
      </div>
    </div>
  );
}
