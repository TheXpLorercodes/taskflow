import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/dashboard" style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 20,
        color: 'var(--text)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: 'var(--accent)' }}>⬡</span> TaskFlow
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{
            color: location.pathname === '/admin' ? 'var(--accent)' : 'var(--text2)',
            fontWeight: 500,
            fontSize: 14,
          }}>Admin</Link>
        )}
        <span style={{ color: 'var(--text2)', fontSize: 14 }}>
          {user?.name} <span style={{
            background: user?.role === 'admin' ? 'rgba(255,101,132,0.15)' : 'rgba(108,99,255,0.15)',
            color: user?.role === 'admin' ? 'var(--accent2)' : 'var(--accent)',
            padding: '2px 8px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            marginLeft: 4,
          }}>{user?.role}</span>
        </span>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: '6px 16px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
