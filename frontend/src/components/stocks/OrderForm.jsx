import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OrderForm({ stock, userPortfolio, onOrderSuccess }) {
  const { user, refreshUser } = useAuth();
  const [orderType, setOrderType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock.current_price || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (stock.current_price && !price) {
      setPrice(stock.current_price);
    }
  }, [stock.current_price]);

  const availableCash = user?.balance || 0;
  const availableShares = userPortfolio?.quantity || 0;

  const totalRequired = +(Number(quantity) * Number(price)).toFixed(2);
  const canAfford = orderType === 'BUY' ? availableCash >= totalRequired : availableShares >= Number(quantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const endpoint = orderType === 'BUY' ? '/orders/buy' : '/orders/sell';
      const res = await api.post(endpoint, {
        stockId: stock.id,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price)
      });

      if (res.data.success) {
        const trades = res.data.data.tradesExecuted || [];
        let msg = `${orderType} order placed for ${quantity} shares @ ₹${price}!`;
        if (trades.length > 0) {
          msg += ` Instant Match: ${trades.length} trade(s) executed immediately!`;
        } else {
          msg += ` Order added to order book waiting for matching counterparty.`;
        }

        setFeedback({ type: 'success', text: msg });
        await refreshUser();
        if (onOrderSuccess) onOrderSuccess();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place order';
      setFeedback({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const setPercentage = (pct) => {
    if (orderType === 'BUY') {
      const prc = parseFloat(price) || stock.current_price;
      if (prc > 0) {
        const maxQty = Math.floor((availableCash * (pct / 100)) / prc);
        setQuantity(Math.max(1, maxQty));
      }
    } else {
      const maxShares = Math.floor(availableShares * (pct / 100));
      setQuantity(Math.max(1, maxShares));
    }
  };

  return (
    <div className="card">
      {/* Tab Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => { setOrderType('BUY'); setFeedback(null); }}
          className={`btn ${orderType === 'BUY' ? 'btn-success' : 'btn-outline'}`}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <ArrowUpRight size={18} /> BUY
        </button>
        <button
          type="button"
          onClick={() => { setOrderType('SELL'); setFeedback(null); }}
          className={`btn ${orderType === 'SELL' ? 'btn-danger' : 'btn-outline'}`}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <ArrowDownRight size={18} /> SELL
        </button>
      </div>

      {/* Available Info */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '0.75rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        fontSize: '0.8rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {orderType === 'BUY' ? 'Available Virtual Cash:' : 'Shares in Portfolio:'}
        </span>
        <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: orderType === 'BUY' ? 'var(--bull-green)' : '#fff' }}>
          {orderType === 'BUY' ? `₹${availableCash.toLocaleString('en-IN')}` : `${availableShares} shares`}
        </span>
      </div>

      {feedback && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: feedback.type === 'success' ? 'var(--bull-green-bg)' : 'var(--bear-red-bg)',
          color: feedback.type === 'success' ? 'var(--bull-green)' : 'var(--bear-red)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Quantity Field */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Quantity (Shares)
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.625rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem'
            }}
          />
          {/* Percentage buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercentage(pct)}
                style={{
                  flex: 1,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '0.2rem',
                  fontSize: '0.7rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Limit Price Field */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Limit Price (₹)</label>
            <span
              onClick={() => setPrice(stock.current_price)}
              style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
            >
              Use Market (₹{stock.current_price})
            </span>
          </div>
          <input
            type="number"
            step="0.05"
            min="0.05"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.625rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Total Cost / Proceeds */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 0',
          borderTop: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {orderType === 'BUY' ? 'Total Cost:' : 'Estimated Proceeds:'}
          </span>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)',
            color: canAfford ? '#fff' : 'var(--bear-red)'
          }}>
            ₹{totalRequired.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !canAfford || quantity <= 0}
          className={`btn ${orderType === 'BUY' ? 'btn-success' : 'btn-danger'}`}
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
        >
          {loading ? 'Submitting...' : !canAfford ? (orderType === 'BUY' ? 'Insufficient Balance' : 'Insufficient Shares') : `Place ${orderType} Order`}
        </button>
      </form>
    </div>
  );
}
