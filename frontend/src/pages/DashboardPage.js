import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import StatsBar from '../components/StatsBar';

const DashboardPage = () => {
  const { user } = useAuth();
  const { tasks, stats, pagination, loading, error, fetchTasks, fetchStats, createTask, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState({ status:'', priority:'', search:'', page:1, limit:9 });
  const [modal, setModal] = useState({ open:false, task:null });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
    fetchTasks(params);
    fetchStats();
  }, [filters, fetchTasks, fetchStats]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (modal.task) {
      await updateTask(modal.task._id, data);
      showToast('Task updated!');
    } else {
      await createTask(data);
      showToast('Task created!');
    }
    fetchStats();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setDeleteConfirm(null);
    showToast('Task deleted', 'error');
    fetchStats();
  };

  const handleStatusChange = async (id, status) => {
    await updateTask(id, { status });
    fetchStats();
  };

  return (
    <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 24px' }}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:26 }}>
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'var(--text2)',marginTop:4 }}>Here's what's on your plate today.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ open:true, task:null })}
          style={{ padding:'10px 22px',fontSize:15 }}>+ New Task</button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats?.stats} overdue={stats?.overdue} />

      {/* Filters */}
      <div style={{ display:'flex',gap:10,marginBottom:24,flexWrap:'wrap' }}>
        <input value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value,page:1}))}
          placeholder="🔍 Search tasks…" style={{ flex:'1 1 200px',minWidth:150 }} />
        <select value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value,page:1}))}
          style={{ flex:'0 0 140px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filters.priority} onChange={e=>setFilters(p=>({...p,priority:e.target.value,page:1}))}
          style={{ flex:'0 0 130px' }}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(filters.status || filters.priority || filters.search) && (
          <button className="btn-ghost" onClick={() => setFilters({ status:'',priority:'',search:'',page:1,limit:9 })}>
            Clear ×
          </button>
        )}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div style={{ textAlign:'center',color:'var(--text2)',padding:'60px 0' }}>Loading tasks…</div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign:'center',padding:'80px 0',color:'var(--text3)' }}>
          <div style={{ fontSize:48,marginBottom:16 }}>📋</div>
          <p style={{ fontSize:16 }}>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16 }}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task}
              onEdit={(t) => setModal({ open:true, task:t })}
              onDelete={(id) => setDeleteConfirm(id)}
              onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:32,alignItems:'center' }}>
          <button className="btn-ghost" disabled={filters.page <= 1}
            onClick={() => setFilters(p=>({...p,page:p.page-1}))}>← Prev</button>
          <span style={{ color:'var(--text2)',fontSize:14 }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button className="btn-ghost" disabled={filters.page >= pagination.totalPages}
            onClick={() => setFilters(p=>({...p,page:p.page+1}))}>Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <TaskModal task={modal.task} onClose={() => setModal({ open:false, task:null })} onSave={handleSave} />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 }}>
          <div className="card" style={{ maxWidth:360,textAlign:'center' }}>
            <div style={{ fontSize:36,marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:8 }}>Delete Task?</h3>
            <p style={{ color:'var(--text2)',marginBottom:24,fontSize:14 }}>This action cannot be undone.</p>
            <div style={{ display:'flex',gap:12,justifyContent:'center' }}>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} style={{ padding:'8px 20px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 20px',borderRadius:8,fontWeight:500,fontSize:14,
          background: toast.type === 'error' ? 'rgba(255,101,132,0.15)' : 'rgba(67,233,123,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(255,101,132,0.4)' : 'rgba(67,233,123,0.4)'}`,
          color: toast.type === 'error' ? 'var(--accent2)' : 'var(--accent3)',
          backdropFilter:'blur(8px)',animation:'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
