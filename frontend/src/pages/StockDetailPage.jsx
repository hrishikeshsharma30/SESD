import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PriceChart from '../components/stocks/PriceChart';
import OrderForm from '../components/stocks/OrderForm';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bookmark, 
  TrendingUp, 
  Layers, 
  Clock 
} from 'lucide-react';

export default function StockDetailPage() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [userPortfolio, setUserPortfolio] = useState(null);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    try {
      const [stockRes, portRes, watchRes] = await Promise.all([
        api.get(`/stocks/${id}`),
        api.get(`/portfolio/${id}`),
        api.get('/watchlist')
      ]);

      if (stockRes.data.success) {
        setStock(stockRes.data.data);
      }
      if (portRes.data.success) {
        setUserPortfolio(portRes.data.data);
      }
      if (watchRes.data.success) {
        const watched = watchRes.data.data.some(w => w.id === parseInt(id, 10));
        setIsWatched(watched);
      }
    } catch (err) {
      console.error('Error fetching stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const toggleWatchlist = async () => {
    try {
      if (isWatched) {
        await api.delete(`/watchlist/${id}`);
        setIsWatched(false);
      } else {
        await api.post(`/watchlist/${id}`);
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  if (loading || !stock) {
    return (
      <div style={{ maxWidth: '1300px', margin: '3rem auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading stock details &amp; order book...
      </div>
    );
  }

  const isUp = stock.change >= 0;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Back button & Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/stocks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Market Stocks
        </Link>
      </div>

      {/* Header Info */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{stock.symbol}</h1>
              <button
                onClick={toggleWatchlist}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <Bookmark size={15} fill={isWatched ? 'currentColor' : 'none'} color={isWatched ? 'var(--gold-accent)' : 'currentColor'} />
                {isWatched ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {stock.company_name}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              ₹{stock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className={isUp ? 'badge badge-bull' : 'badge badge-bear'} style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {isUp ? '+' : ''}₹{stock.change} ({isUp ? '+' : ''}{stock.changePercent}%)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Prev: ₹{stock.previous_price}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Order Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Chart Column */}
        <div className="card">
          <PriceChart
            symbol={stock.symbol}
            currentPrice={stock.current_price}
            previousPrice={stock.previous_price}
          />
        </div>

        {/* Order Form Column */}
        <div>
          <OrderForm
            stock={stock}
            userPortfolio={userPortfolio}
            onOrderSuccess={fetchStockData}
          />
        </div>
      </div>

      {/* Bottom Grid: Live Order Book Depth & Recent Trades */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Order Book Depth */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Order Book (Market Depth)</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Bids (BUY) */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--bull-green)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                BIDS (BUY)
              </div>
              {stock.orderBook?.bids?.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active buy bids</div>
              ) : (
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.orderBook?.bids?.map((b, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{b.quantity}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)', fontWeight: '600' }}>
                          ₹{b.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Asks (SELL) */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--bear-red)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                ASKS (SELL)
              </div>
              {stock.orderBook?.asks?.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active sell asks</div>
              ) : (
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left' }}>Price (₹)</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.orderBook?.asks?.map((a, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--bear-red)', fontWeight: '600' }}>
                          ₹{a.price.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{a.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Recent Trades for this stock */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Executed Trades</h2>
          </div>

          {stock.recentTrades?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No trades executed yet for this stock. Compatible buy and sell orders will execute here!
            </div>
          ) : (
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem 0', textAlign: 'left' }}>Trade ID</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Quantity</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Executed Price</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {stock.recentTrades?.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                      {t.quantity}
                    </td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)', fontWeight: '700' }}>
                      ₹{t.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(t.executed_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
