import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '', description: '', status: 'pending', priority: 'medium', dueDate: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: (task.tags || []).join(', '),
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (!payload.dueDate) delete payload.dueDate;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:20 }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding:'4px 10px',fontSize:18 }}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div>
            <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required placeholder="Task title..." />
          </div>
          <div>
            <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
              rows={3} placeholder="What needs to be done?" style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            <div>
              <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Status</label>
              <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(p=>({...p,dueDate:e.target.value}))} />
          </div>
          <div>
            <label style={{ display:'block',marginBottom:6,fontSize:13,color:'var(--text2)' }}>Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm(p=>({...p,tags:e.target.value}))} placeholder="design, backend, urgent" />
          </div>
          <div style={{ display:'flex',gap:12,justifyContent:'flex-end',marginTop:8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
