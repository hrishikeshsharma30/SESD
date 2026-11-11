import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Eye, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [portRes, stocksRes, watchRes, ordersRes, txRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/stocks'),
        api.get('/watchlist'),
        api.get('/orders/open'),
        api.get('/transactions?limit=5')
      ]);

      if (portRes.data.success) setPortfolio(portRes.data.data);
      if (stocksRes.data.success) setStocks(stocksRes.data.data);
      if (watchRes.data.success) setWatchlist(watchRes.data.data);
      if (ordersRes.data.success) setOpenOrders(ordersRes.data.data);
      if (txRes.data.success) setRecentTransactions(txRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll updates every 4 seconds to sync live price simulation & trades
    const timer = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(timer);
  }, []);

  const summary = portfolio?.summary || {
    cash_balance: user?.balance || 0,
    portfolio_value: 0,
    total_net_worth: user?.balance || 0,
    total_profit_loss: 0,
    total_profit_loss_percent: 0
  };

  const isProfit = summary.total_profit_loss >= 0;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Notice Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>
            <strong>SESD College Trading Simulator</strong> &bull; Virtual Currency Only &bull; All trades matched via Price-Time Priority Engine
          </span>
        </div>
        <span className="badge badge-bull">Engine Active</span>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Cash Balance */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Virtual Cash Balance</span>
            <div style={{ padding: '0.35rem', backgroundColor: 'var(--bull-green-bg)', borderRadius: '6px', color: 'var(--bull-green)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)' }}>
            ₹{summary.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Available funds for BUY limit orders
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Portfolio Valuation</span>
            <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.12)', borderRadius: '6px', color: 'var(--accent-primary)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#fff' }}>
            ₹{summary.portfolio_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {portfolio?.holdings?.length || 0} active stock holding(s)
          </div>
        </div>

        {/* Total Net Worth */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Account Wealth</span>
            <div style={{ padding: '0.35rem', backgroundColor: 'var(--gold-bg)', borderRadius: '6px', color: 'var(--gold-accent)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--gold-accent)' }}>
            ₹{summary.total_net_worth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cash + Current Portfolio Value
          </div>
        </div>

        {/* Total Profit & Loss */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unrealized Profit / Loss</span>
            <div style={{
              padding: '0.35rem',
              backgroundColor: isProfit ? 'var(--bull-green-bg)' : 'var(--bear-red-bg)',
              borderRadius: '6px',
              color: isProfit ? 'var(--bull-green)' : 'var(--bear-red)'
            }}>
              {isProfit ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            </div>
          </div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            color: isProfit ? 'var(--bull-green)' : 'var(--bear-red)'
          }}>
            {isProfit ? '+' : ''}₹{summary.total_profit_loss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
            <span className={isProfit ? 'badge badge-bull' : 'badge badge-bear'}>
              {isProfit ? '+' : ''}{summary.total_profit_loss_percent}% return
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Popular Stocks & Open Orders */}
        <div>
          {/* Popular Stocks Table */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Market Overview &bull; Live Prices</h2>
              <Link to="/stocks" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All Stocks <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Price (₹)</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>24h Change</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.slice(0, 6).map((s) => {
                    const isUp = s.change >= 0;
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <Link to={`/stocks/${s.id}`} style={{ fontWeight: '700', color: '#fff' }}>
                            {s.symbol}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.company_name}</div>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                          ₹{s.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <span className={isUp ? 'badge badge-bull' : 'badge badge-bear'}>
                            {isUp ? '+' : ''}{s.changePercent}%
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <Link to={`/stocks/${s.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                            Trade
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Open Orders */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Your Open Orders</h2>
              <Link to="/orders" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Manage Orders <ChevronRight size={16} />
              </Link>
            </div>

            {openOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active open orders in the book. Place a buy or sell limit order to trade!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Stock</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Type</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Qty Remaining</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Limit Price</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.5rem', fontWeight: '600' }}>{o.symbol}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <span className={o.order_type === 'BUY' ? 'badge badge-bull' : 'badge badge-bear'}>
                            {o.order_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {o.remaining_quantity} / {o.quantity}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ₹{parseFloat(o.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                          <span className="badge badge-gold">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Watchlist & Recent Ledger Activity */}
        <div>
          {/* Watchlist Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Watchlist</h2>
              <Link to="/watchlist" style={{ fontSize: '0.85rem' }}>View All</Link>
            </div>

            {watchlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Your watchlist is empty. Add stocks from the market to monitor them closely!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {watchlist.map((w) => {
                  const isUp = w.change >= 0;
                  return (
                    <Link
                      key={w.id}
                      to={`/stocks/${w.id}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        color: 'inherit'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{w.symbol}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.company_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                          ₹{w.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isUp ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                          {isUp ? '+' : ''}{w.changePercent}%
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Ledger Transactions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Recent Transactions</h2>
              <Link to="/transactions" style={{ fontSize: '0.85rem' }}>History</Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent transactions recorded.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '0.65rem 0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }} className={
                        tx.transaction_type.includes('CREDIT') || tx.transaction_type.includes('DEPOSIT') || tx.transaction_type.includes('REFUND')
                          ? 'text-bull'
                          : 'text-bear'
                      }>
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.85rem' }}>
                        ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
