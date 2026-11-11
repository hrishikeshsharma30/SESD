import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, UserCheck, UserX, Search, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change ${user.name}'s status to ${nextStatus}?`)) {
      return;
    }

    setUpdatingId(user.id);
    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { status: nextStatus });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Monitor investor accounts and manage access permissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.45rem 1rem 0.45rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                width: '260px'
              }}
            />
          </div>
          <button onClick={fetchUsers} className="btn btn-outline" style={{ padding: '0.45rem 0.75rem' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>User ID</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Full Name</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Email Address</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Virtual Balance</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Account Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{u.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: '700', color: '#fff' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className={u.role === 'ADMIN' ? 'badge badge-gold' : 'badge'}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--bull-green)' }}>
                      ₹{u.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <span className={u.status === 'ACTIVE' ? 'badge badge-bull' : 'badge badge-bear'}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={updatingId === u.id}
                          className={u.status === 'ACTIVE' ? 'btn btn-danger' : 'btn btn-success'}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          {u.status === 'ACTIVE' ? (
                            <><UserX size={13} /> Deactivate</>
                          ) : (
                            <><UserCheck size={13} /> Activate</>
                          )}
                        </button>
                      )}
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
