import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, AlertCircle, UserPlus, Gift } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create Investor Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Start your virtual stock trading journey today
          </p>
        </div>

        {/* Bonus Banner */}
        <div style={{
          backgroundColor: 'var(--bull-green-bg)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Gift size={24} style={{ color: 'var(--bull-green)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--bull-green)' }}>
              ₹10,00,000 Virtual Starting Cash
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Demo money credited automatically for simulated trading.
            </div>
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hrishikesh Sharma"
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              Password (min 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="6"
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
            className="btn btn-success"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register & Claim ₹10,00,000'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
