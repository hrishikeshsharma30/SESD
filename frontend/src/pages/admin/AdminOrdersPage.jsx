import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load system orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(o =>
    o.symbol.toLowerCase().includes(search.toLowerCase()) ||
    o.user_name.toLowerCase().includes(search.toLowerCase()) ||
    o.user_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Admin Overview
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>System Orders Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live inspection of all limit orders submitted across the virtual exchange
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search by stock, trader name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              width: '280px'
            }}
          />
          <button onClick={fetchOrders} className="btn btn-outline" style={{ padding: '0.45rem 0.75rem' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading system orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Order ID</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Trader Account</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Total Qty</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Remaining</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Limit Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{o.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{o.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700' }}>
                      {o.symbol}
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
