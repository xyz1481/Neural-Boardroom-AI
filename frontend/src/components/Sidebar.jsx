import React from 'react';

export function Sidebar({ onNewSession }) {
  const recentSessions = [
    "SaaS Market Entry",
    "Product Launch Strategy",
    "Hiring Roadmap Q4",
    "Competitive Analysis"
  ];

  return (
    <aside className="perplexity-sidebar">
      <div className="sidebar-brand">
        <span>B</span> Boardroom AI
      </div>

      <button className="new-session-btn" onClick={onNewSession}>
        + New Session
      </button>

      <div className="nav-item active">Home</div>
      <div className="nav-item">Agents</div>
      <div className="nav-item">Analytics</div>
      <div className="nav-item">Settings</div>

      <div style={{ marginTop: '32px', marginBottom: '12px', fontSize: '10px', color: '#5a5a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px' }}>
        Library
      </div>
      {recentSessions.map((s, i) => (
        <div key={i} className="nav-item" style={{ fontSize: '0.8rem' }}>
          {s}
        </div>
      ))}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderTop: '1px solid #2a2a2a' }}>
        <div style={{ width: '32px', height: '32px', background: '#2a2a2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>U</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Neural User</span>
          <span style={{ fontSize: '10px', color: '#5a5a5a' }}>Pro Plan</span>
        </div>
      </div>
    </aside>
  );
}
