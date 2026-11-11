import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, RefreshCw, Layers } from 'lucide-react';

export default function AdminTradesPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = async () => {
    try {
      const res = await api.get('/admin/trades');
      if (res.data.success) {
        setTrades(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load system trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Admin Overview
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Executed Trades Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            System-wide audit trail of matched orders and executed market trades
          </p>
        </div>
        <button onClick={fetchTrades} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={15} /> Refresh Trades
        </button>
      </div>

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading executed trades...</div>
        ) : trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No trades executed yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Trade ID</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Buyer</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Seller</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Shares</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Price (₹)</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Total Volume (₹)</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Executed At</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: '#fff' }}>
                      {t.symbol}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.company_name}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--bull-green)' }}>{t.buyer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order #{t.buy_order_id}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--bear-red)' }}>{t.seller_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order #{t.sell_order_id}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {t.quantity}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)', fontWeight: '700' }}>
                      ₹{t.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      ₹{t.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(t.executed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
