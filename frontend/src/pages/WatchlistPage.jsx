import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bookmark, Trash2, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      if (res.data.success) {
        setWatchlist(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = async (stockId) => {
    try {
      await api.delete(`/watchlist/${stockId}`);
      setWatchlist(prev => prev.filter(s => s.id !== stockId));
    } catch (err) {
      console.error('Failed to remove stock:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Your Watchlist</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Curated list of equities you are monitoring for trading opportunities
          </p>
        </div>
        <Link to="/stocks" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={16} /> Explore Stocks to Watch
        </Link>
      </div>

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading watchlist...</div>
        ) : watchlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Bookmark size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You don't have any stocks on your watchlist yet.
            </p>
            <Link to="/stocks" className="btn btn-outline">
              Browse Market Stocks
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Symbol</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Company Name</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Current Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>24h Change</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((s) => {
                  const isUp = s.change >= 0;
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        <Link to={`/stocks/${s.id}`} style={{ color: '#fff' }}>
                          {s.symbol}
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {s.company_name}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        ₹{s.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <span className={isUp ? 'badge badge-bull' : 'badge badge-bear'}>
                          {isUp ? '+' : ''}{s.changePercent}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Link to={`/stocks/${s.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                            Trade
                          </Link>
                          <button
                            onClick={() => handleRemove(s.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--bear-red)' }}
                            title="Remove from Watchlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
