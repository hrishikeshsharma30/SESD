import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  // Form states
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStocks = async () => {
    try {
      const res = await api.get('/stocks');
      if (res.data.success) {
        setStocks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.post('/stocks', {
        symbol: symbol.trim().toUpperCase(),
        company_name: companyName.trim(),
        current_price: parseFloat(price)
      });

      if (res.data.success) {
        setFormSuccess(`Stock ${symbol.toUpperCase()} successfully listed!`);
        setSymbol('');
        setCompanyName('');
        setPrice('');
        fetchStocks();
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess(null);
        }, 1200);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to list stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await api.put(`/stocks/${editingStock.id}`, {
        company_name: editingStock.company_name,
        current_price: parseFloat(editingStock.current_price)
      });

      if (res.data.success) {
        setEditingStock(null);
        fetchStocks();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStock = async (stock) => {
    if (!window.confirm(`Are you sure you want to delist ${stock.symbol}? Existing open orders and portfolio positions for this stock will be affected.`)) {
      return;
    }

    try {
      await api.delete(`/stocks/${stock.id}`);
      setStocks(prev => prev.filter(s => s.id !== stock.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete stock');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Admin Overview
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Stock Catalog Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            List new equities, modify existing instrument details, or delist stocks
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setFormError(null); }}
          className="btn btn-success"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Plus size={16} /> List New Stock
        </button>
      </div>

      {/* Stocks Table */}
      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading stock catalog...</div>
        ) : stocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No stocks in exchange.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Symbol</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Company Name</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Current Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Previous Price</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {s.symbol}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {s.company_name}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      ₹{s.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ₹{s.previous_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingStock(s)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Edit Stock"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStock(s)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Delist Stock"
                        >
                          <Trash2 size={14} /> Delist
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '460px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>List New Stock on Exchange</h2>

            {formError && (
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bear-red-bg)', color: 'var(--bear-red)', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bull-green-bg)', color: 'var(--bull-green)', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Stock Symbol (Ticker)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZOMATO"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Company Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zomato Limited"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Initial Market Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  placeholder="e.g. 260.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-success">
                  {submitting ? 'Listing...' : 'List Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '460px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
              Edit Stock {editingStock.symbol}
            </h2>

            <form onSubmit={handleUpdateStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={editingStock.company_name}
                  onChange={(e) => setEditingStock({ ...editingStock, company_name: e.target.value })}
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Base Market Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  value={editingStock.current_price}
                  onChange={(e) => setEditingStock({ ...editingStock, current_price: e.target.value })}
                  required
                  style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingStock(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
