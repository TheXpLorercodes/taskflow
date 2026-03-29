import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16,
      background:'radial-gradient(ellipse at 60% 40%, rgba(108,99,255,0.08) 0%, transparent 60%)' }}>
      <div style={{ width:'100%',maxWidth:400 }}>
        <div style={{ textAlign:'center',marginBottom:36 }}>
          <div style={{ fontSize:40,marginBottom:8 }}>⬡</div>
          <h1 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:28,color:'var(--text)' }}>TaskFlow</h1>
          <p style={{ color:'var(--text2)',marginTop:6 }}>Sign in to your workspace</p>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div>
              <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                required placeholder="you@example.com" autoFocus />
            </div>
            <div>
              <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Password</label>
              <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:8,padding:'12px',fontSize:15 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign:'center',marginTop:20,color:'var(--text2)',fontSize:14 }}>
            No account? <Link to="/register">Create one →</Link>
          </p>
        </div>
        <p style={{ textAlign:'center',marginTop:16,color:'var(--text3)',fontSize:12 }}>
          Demo admin: admin@taskflow.com / Admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
