import React from 'react';

const StatBox = ({ label, value, color }) => (
  <div className="card" style={{ flex:1, minWidth:120, textAlign:'center', padding:'20px 16px' }}>
    <div style={{ fontSize:32,fontWeight:800,fontFamily:'var(--font-display)',color: color || 'var(--accent)' }}>{value}</div>
    <div style={{ fontSize:12,color:'var(--text2)',marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em' }}>{label}</div>
  </div>
);

const StatsBar = ({ stats, overdue }) => {
  const getCount = (status) => stats?.find(s => s._id === status)?.count || 0;
  const total = stats?.reduce((a,s) => a + s.count, 0) || 0;

  return (
    <div style={{ display:'flex',gap:12,flexWrap:'wrap',marginBottom:28 }}>
      <StatBox label="Total" value={total} color="var(--text)" />
      <StatBox label="Pending" value={getCount('pending')} color="#ffc107" />
      <StatBox label="In Progress" value={getCount('in-progress')} color="var(--accent)" />
      <StatBox label="Completed" value={getCount('completed')} color="var(--accent3)" />
      <StatBox label="Overdue" value={overdue || 0} color="var(--accent2)" />
    </div>
  );
};

export default StatsBar;
