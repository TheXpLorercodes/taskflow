import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 15 });
      setUsers(data.data.users);
      setPagination(data.pagination);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggle = async (userId) => {
    try {
      const { data } = await adminAPI.toggleUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? data.data.user : u));
      showToast(`User ${data.data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle user', 'error');
    }
  };

  return (
    <div style={{ maxWidth:900,margin:'0 auto',padding:'0 24px' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:26 }}>Admin Panel</h1>
        <p style={{ color:'var(--text2)',marginTop:4 }}>Manage users and platform settings.</p>
      </div>

      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ padding:'16px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16 }}>
            Users <span style={{ color:'var(--text3)',fontWeight:400,fontSize:14 }}>({pagination.total || 0} total)</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign:'center',padding:'48px',color:'var(--text2)' }}>Loading users…</div>
        ) : (
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Name','Email','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 20px',textAlign:'left',fontSize:12,fontWeight:600,
                    color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom:'1px solid var(--border)',background: i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding:'14px 20px',fontSize:14,fontWeight:500 }}>{u.name}</td>
                  <td style={{ padding:'14px 20px',fontSize:13,color:'var(--text2)' }}>{u.email}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,
                      background: u.role==='admin'?'rgba(255,101,132,0.12)':'rgba(108,99,255,0.12)',
                      color: u.role==='admin'?'var(--accent2)':'var(--accent)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,
                      background: u.isActive?'rgba(67,233,123,0.12)':'rgba(144,144,168,0.12)',
                      color: u.isActive?'var(--accent3)':'var(--text3)' }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px',fontSize:12,color:'var(--text3)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleToggle(u._id)}
                        style={{ padding:'5px 14px',fontSize:12,borderRadius:6,border:'1px solid var(--border)',
                          background:'transparent',cursor:'pointer',fontFamily:'var(--font-body)',
                          color: u.isActive?'var(--accent2)':'var(--accent3)',
                          borderColor: u.isActive?'rgba(255,101,132,0.4)':'rgba(67,233,123,0.4)',
                          transition:'all 0.2s' }}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.totalPages > 1 && (
          <div style={{ display:'flex',justifyContent:'center',gap:8,padding:'16px',borderTop:'1px solid var(--border)',alignItems:'center' }}>
            <button className="btn-ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{padding:'5px 12px',fontSize:13}}>← Prev</button>
            <span style={{ color:'var(--text2)',fontSize:13 }}>Page {page} of {pagination.totalPages}</span>
            <button className="btn-ghost" disabled={page>=pagination.totalPages} onClick={()=>setPage(p=>p+1)} style={{padding:'5px 12px',fontSize:13}}>Next →</button>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 20px',borderRadius:8,fontWeight:500,fontSize:14,
          background: toast.type==='error'?'rgba(255,101,132,0.15)':'rgba(67,233,123,0.15)',
          border:`1px solid ${toast.type==='error'?'rgba(255,101,132,0.4)':'rgba(67,233,123,0.4)'}`,
          color: toast.type==='error'?'var(--accent2)':'var(--accent3)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
