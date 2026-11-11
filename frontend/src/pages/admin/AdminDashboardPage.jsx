import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  LineChart, 
  ListOrdered, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>Admin Control Center</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.25rem' }}>Exchange Administration</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            System-wide trading telemetry, stock catalog management, and user controls
          </p>
        </div>
        <button onClick={fetchStats} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={15} /> Refresh Telemetry
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Total Users</span>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
            {stats?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--bull-green)', marginTop: '0.25rem' }}>
            {stats?.activeUsers || 0} active accounts
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Listed Equities</span>
            <LineChart size={18} style={{ color: 'var(--bull-green)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
            {stats?.totalStocks || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Active market instruments
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Open Limit Orders</span>
            <ListOrdered size={18} style={{ color: 'var(--gold-accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
            {stats?.openOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Resting in order books
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Executed Trades</span>
            <CheckCircle2 size={18} style={{ color: 'var(--bull-green)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)' }}>
            {stats?.completedTrades || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Matched by engine
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>Traded Volume</span>
            <TrendingUp size={18} style={{ color: 'var(--gold-accent)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--gold-accent)' }}>
            ₹{(stats?.totalVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cumulative turnover
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Administrative Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        <Link to="/admin/users" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'inherit' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>User Management</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              View all registered investors, inspect virtual balances, and activate or deactivate trader accounts.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem' }}>
            Manage Users <ChevronRight size={16} />
          </div>
        </Link>

        <Link to="/admin/stocks" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'inherit' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--bull-green-bg)', color: 'var(--bull-green)', borderRadius: 'var(--radius-sm)' }}>
                <LineChart size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Stock Catalog</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Add new equities, update existing company names, adjust base market prices, or delete stocks from the exchange.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--bull-green)', fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem' }}>
            Manage Stocks <ChevronRight size={16} />
          </div>
        </Link>

        <Link to="/admin/orders" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'inherit' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--gold-bg)', color: 'var(--gold-accent)', borderRadius: 'var(--radius-sm)' }}>
                <ListOrdered size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>System Orders</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Inspect all resting and executed limit orders placed across the exchange by all traders.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold-accent)', fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem' }}>
            View Orders <ChevronRight size={16} />
          </div>
        </Link>

        <Link to="/admin/trades" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'inherit' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', borderRadius: 'var(--radius-sm)' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Matching Engine Trades</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Inspect live trade executions, buyer-seller counterparty pairs, and settlement execution prices.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#a855f7', fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem' }}>
            View Trades <ChevronRight size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
}
