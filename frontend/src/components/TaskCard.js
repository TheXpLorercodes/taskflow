import React from 'react';

const priorityOrder = { high: 3, medium: 2, low: 1 };

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="card" style={{ padding:18, borderLeft: isOverdue ? '3px solid var(--accent2)' : '3px solid transparent', transition:'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = isOverdue ? 'var(--accent2)' : 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isOverdue ? 'var(--accent2)' : 'transparent'}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6 }}>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            <span className={`badge badge-${task.status}`}>{task.status}</span>
            {isOverdue && <span style={{ fontSize:11,color:'var(--accent2)' }}>⚠ Overdue</span>}
          </div>
          <h3 style={{ fontFamily:'var(--font-display)',fontWeight:600,fontSize:16,marginBottom:4,
            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
            color: task.status === 'completed' ? 'var(--text3)' : 'var(--text)' }}>
            {task.title}
          </h3>
          {task.description && (
            <p style={{ color:'var(--text2)',fontSize:13,marginBottom:8,lineHeight:1.5 }}>
              {task.description.length > 100 ? task.description.slice(0,100)+'…' : task.description}
            </p>
          )}
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
            {task.dueDate && (
              <span style={{ fontSize:12,color: isOverdue ? 'var(--accent2)' : 'var(--text3)' }}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} style={{ fontSize:11,background:'var(--surface2)',color:'var(--text2)',padding:'1px 8px',borderRadius:20 }}>#{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:6,minWidth:36 }}>
          <button className="btn-ghost" onClick={() => onEdit(task)} style={{ padding:'4px 8px',fontSize:14 }} title="Edit">✏️</button>
          <button className="btn-danger" onClick={() => onDelete(task._id)} style={{ padding:'4px 8px',fontSize:14 }} title="Delete">🗑</button>
        </div>
      </div>
      <div style={{ marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',gap:6 }}>
        {['pending','in-progress','completed'].map(s => (
          <button key={s} onClick={() => onStatusChange(task._id, s)}
            style={{ flex:1,padding:'4px 0',fontSize:11,fontWeight:500,borderRadius:6,border:'1px solid var(--border)',
              background: task.status===s ? 'var(--accent)' : 'transparent',
              color: task.status===s ? '#fff' : 'var(--text3)',cursor:'pointer',transition:'all 0.2s' }}>
            {s.replace('-',' ')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskCard;
