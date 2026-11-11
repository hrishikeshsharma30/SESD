import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Filter, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const url = `/transactions${filterType ? `?type=${filterType}` : ''}`;
      const res = await api.get(url);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BUY_DEDUCTION':
        return <span className="badge badge-bear">BUY DEBIT</span>;
      case 'SELL_CREDIT':
        return <span className="badge badge-bull">SELL CREDIT</span>;
      case 'ORDER_CANCEL_REFUND':
        return <span className="badge badge-gold">REFUND</span>;
      case 'INITIAL_DEPOSIT':
        return <span className="badge badge-bull">INITIAL GRANT</span>;
      default:
        return <span className="badge">{type}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Complete immutable financial audit trail of all virtual currency debits and credits
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            <option value="">All Transaction Types</option>
            <option value="BUY_DEDUCTION">Buy Deductions</option>
            <option value="SELL_CREDIT">Sell Credits</option>
            <option value="ORDER_CANCEL_REFUND">Order Refunds</option>
            <option value="INITIAL_DEPOSIT">Initial Account Deposits</option>
          </select>

          <button onClick={fetchTransactions} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading ledger...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No transactions match this filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Tx ID</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock Details</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Description</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.transaction_type === 'SELL_CREDIT' || tx.transaction_type === 'INITIAL_DEPOSIT' || tx.transaction_type === 'ORDER_CANCEL_REFUND';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        #{tx.id}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {getTypeBadge(tx.transaction_type)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {tx.stock_symbol ? (
                          <div>
                            <span style={{ fontWeight: '700', color: '#fff' }}>{tx.stock_symbol}</span>
                            {tx.trade_quantity && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                ({tx.trade_quantity} @ ₹{tx.trade_price})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{
                        padding: '0.85rem 0.5rem',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: isCredit ? 'var(--bull-green)' : 'var(--bear-red)'
                      }}>
                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(tx.created_at).toLocaleString()}
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
