import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Bookmark, ArrowUpRight, ArrowDownRight, Check, LayoutGrid, List } from 'lucide-react';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'
  const [loading, setLoading] = useState(true);

  const fetchStocksAndWatchlist = async () => {
    try {
      const [stocksRes, watchRes] = await Promise.all([
        api.get(`/stocks${search ? `?search=${encodeURIComponent(search)}` : ''}`),
        api.get('/watchlist')
      ]);

      if (stocksRes.data.success) {
        setStocks(stocksRes.data.data);
      }
      if (watchRes.data.success) {
        setWatchlistIds(new Set(watchRes.data.data.map(w => w.id)));
      }
    } catch (err) {
      console.error('Failed to load stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocksAndWatchlist();
    const interval = setInterval(fetchStocksAndWatchlist, 4000);
    return () => clearInterval(interval);
  }, [search]);

  const toggleWatchlist = async (stockId) => {
    try {
      if (watchlistIds.has(stockId)) {
        await api.delete(`/watchlist/${stockId}`);
        setWatchlistIds(prev => {
          const next = new Set(prev);
          next.delete(stockId);
          return next;
        });
      } else {
        await api.post(`/watchlist/${stockId}`);
        setWatchlistIds(prev => new Set(prev).add(stockId));
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Market Stocks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Simulated Indian Equities &bull; Real-time pricing &amp; Instant limit order matching
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                width: '280px'
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: '#fff',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: '#fff',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading market stocks...</div>
      ) : stocks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No stocks found matching "{search}"</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 0.5rem', width: '40px' }}></th>
                <th style={{ padding: '0.85rem 0.5rem' }}>Symbol</th>
                <th style={{ padding: '0.85rem 0.5rem' }}>Company</th>
                <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Current Price</th>
                <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Prev Close</th>
                <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>24h Change</th>
                <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => {
                const isUp = s.change >= 0;
                const isWatched = watchlistIds.has(s.id);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <button
                        onClick={() => toggleWatchlist(s.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isWatched ? 'var(--gold-accent)' : 'var(--text-muted)'
                        }}
                        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Bookmark size={18} fill={isWatched ? 'currentColor' : 'none'} />
                      </button>
                    </td>
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
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ₹{s.previous_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <span className={isUp ? 'badge badge-bull' : 'badge badge-bear'}>
                        {isUp ? '+' : ''}{s.changePercent}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <Link to={`/stocks/${s.id}`} className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {stocks.map((s) => {
            const isUp = s.change >= 0;
            const isWatched = watchlistIds.has(s.id);
            return (
              <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <Link to={`/stocks/${s.id}`} style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                        {s.symbol}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {s.company_name}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWatchlist(s.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isWatched ? 'var(--gold-accent)' : 'var(--text-muted)'
                      }}
                    >
                      <Bookmark size={18} fill={isWatched ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                      ₹{s.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span className={isUp ? 'badge badge-bull' : 'badge badge-bear'}>
                        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {isUp ? '+' : ''}{s.changePercent}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Prev: ₹{s.previous_price}
                      </span>
                    </div>
                  </div>
                </div>

                <Link to={`/stocks/${s.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Open Trading Terminal
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
