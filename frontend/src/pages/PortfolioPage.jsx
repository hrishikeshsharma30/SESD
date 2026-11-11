import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 4000);
    return () => clearInterval(interval);
  }, []);

  const summary = portfolio?.summary || {
    cash_balance: 0,
    portfolio_value: 0,
    total_invested: 0,
    total_profit_loss: 0,
    total_profit_loss_percent: 0,
    total_net_worth: 0
  };

  const isOverallProfit = summary.total_profit_loss >= 0;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Investment Portfolio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live holdings, cost basis calculations, and unrealized profit &amp; loss
          </p>
        </div>
        <button onClick={fetchPortfolio} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={15} /> Refresh Holdings
        </button>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Invested</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
            ₹{summary.total_invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Initial acquisition cost</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Valuation</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            ₹{summary.portfolio_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>At live market prices</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Unrealized P&amp;L</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            color: isOverallProfit ? 'var(--bull-green)' : 'var(--bear-red)'
          }}>
            {isOverallProfit ? '+' : ''}₹{summary.total_profit_loss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
            <span className={isOverallProfit ? 'badge badge-bull' : 'badge badge-bear'}>
              {isOverallProfit ? '+' : ''}{summary.total_profit_loss_percent}%
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cash Balance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)' }}>
            ₹{summary.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Liquid virtual funds</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0.75rem 0' }}>Your Holdings</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading holdings...</div>
        ) : portfolio?.holdings?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No stock holdings currently in your portfolio. Go to Market Stocks to buy shares!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Shares Owned</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Avg Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Current Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Current Value</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Profit / Loss</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Trade</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => {
                  const isHoldingProfit = h.profit_loss >= 0;
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <Link to={`/stocks/${h.stockId}`} style={{ fontWeight: '700', color: '#fff' }}>
                          {h.symbol}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.company_name}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                        {h.quantity}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ₹{h.average_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                        ₹{h.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                        ₹{h.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <div style={{
                          fontWeight: '700',
                          fontFamily: 'var(--font-mono)',
                          color: isHoldingProfit ? 'var(--bull-green)' : 'var(--bear-red)'
                        }}>
                          {isHoldingProfit ? '+' : ''}₹{h.profit_loss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>
                          <span className={isHoldingProfit ? 'badge badge-bull' : 'badge badge-bear'} style={{ padding: '0.1rem 0.4rem' }}>
                            {isHoldingProfit ? '+' : ''}{h.profit_loss_percent}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <Link to={`/stocks/${h.stockId}`} className="btn btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                          Buy / Sell
                        </Link>
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
