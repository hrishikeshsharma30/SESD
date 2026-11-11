import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Wallet, Shield, CheckCircle2, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bull-green-bg)',
            color: 'var(--bull-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.5rem'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="badge badge-bull">{user?.role}</span>
              <span className="badge badge-gold">{user?.status}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Virtual Cash Balance</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--bull-green)', marginTop: '0.2rem' }}>
              ₹{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account ID</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              USR-{user?.id ? String(user.id).padStart(5, '0') : '00000'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trading Mode</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              Simulation / Sandbox
            </div>
          </div>
        </div>
      </div>

      {/* Project Disclaimer Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} style={{ color: 'var(--gold-accent)' }} />
          Software Engineering and System Design (SESD) College Project
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This system is an academic simulation built to demonstrate real-time order books, price-time priority order matching algorithms, atomic database transactions, and scalable multi-tier financial architectures.
          All balances, stocks, and trades are strictly virtual and do not involve real money.
        </p>
      </div>
    </div>
  );
}
