import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ListOrdered, XCircle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'history'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      const endpoint = activeTab === 'open' ? '/orders/open' : '/orders/history';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Any unexecuted funds or shares will be immediately refunded.')) {
      return;
    }

    setCancellingId(orderId);
    setMessage(null);

    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Order #${orderId} cancelled. Unfilled funds/shares refunded.` });
        await refreshUser();
        fetchOrders();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel order' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Order Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Track active limit orders and complete order history
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('open')}
            style={{
              background: activeTab === 'open' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              color: activeTab === 'open' ? '#fff' : 'var(--text-secondary)',
              padding: '0.4rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Open Orders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: activeTab === 'history' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
              padding: '0.4rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Order History
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: message.type === 'success' ? 'var(--bull-green-bg)' : 'var(--bear-red-bg)',
          color: message.type === 'success' ? 'var(--bull-green)' : 'var(--bear-red)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'open' ? 'No active open orders.' : 'No past order history.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Order ID</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Total Qty</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Remaining</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Limit Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Date Placed</th>
                  {activeTab === 'open' && <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{o.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700' }}>
                      <Link to={`/stocks/${o.stock_id}`} style={{ color: '#fff' }}>
                        {o.symbol}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.company_name}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className={o.order_type === 'BUY' ? 'badge badge-bull' : 'badge badge-bear'}>
                        {o.order_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {o.quantity}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {o.remaining_quantity}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                      ₹{parseFloat(o.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <span className={
                        o.status === 'FILLED' ? 'badge badge-bull' :
                        o.status === 'CANCELLED' ? 'badge badge-bear' :
                        'badge badge-gold'
                      }>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    {activeTab === 'open' && (
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          disabled={cancellingId === o.id}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <XCircle size={14} /> {cancellingId === o.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </td>
                    )}
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
