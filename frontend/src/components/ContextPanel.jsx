import React from 'react';

export function ContextPanel({ objective, activeAgents, tokenUsage, simulationState }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Strategic Goal */}
      <div>
        <div style={{ fontSize: '10px', color: '#5a5a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Strategic Goal
        </div>
        <div style={{ fontSize: '14px', color: '#e0e0e0', lineHeight: '1.5' }}>
          {objective || "Establish the primary objective to begin the neural boardroom simulation."}
        </div>
      </div>

      {/* Boardroom Sync */}
      <div>
        <div style={{ fontSize: '10px', color: '#5a5a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Boardroom Sync
        </div>
        {['CEO', 'CTO', 'CFO', 'CMO', 'Researcher'].map(agent => {
          const isActive = activeAgents.includes(agent);
          const isResolved = simulationState === 'resolved';
          return (
            <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: isActive ? (isResolved ? '#22c55e' : '#3b82f6') : '#2a2a2a',
                boxShadow: (isActive && !isResolved) ? '0 0 8px #3b82f6' : 'none'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? 'white' : '#5a5a5a' }}>{agent}</span>
              {isActive && !isResolved && <span style={{ fontSize: '8px', color: '#3b82f6', fontWeight: '900', marginLeft: 'auto' }}>THINKING</span>}
              {isActive && isResolved && <span style={{ fontSize: '8px', color: '#22c55e', fontWeight: '900', marginLeft: 'auto' }}>SYNCED</span>}
            </div>
          );
        })}
      </div>

      {/* Telemetry */}
      <div>
        <div style={{ fontSize: '10px', color: '#5a5a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Telemetry
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#5a5a5a' }}>Tokens</span>
            <span style={{ fontWeight: 'bold' }}>{tokenUsage.tokens}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#5a5a5a' }}>Cost</span>
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${tokenUsage.cost.toFixed(4)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#5a5a5a' }}>Latency</span>
            <span style={{ fontWeight: 'bold' }}>0.8s</span>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div>
        <div style={{ fontSize: '10px', color: '#5a5a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Context Sources
        </div>
        {[1, 2].map(i => (
          <div key={i} style={{ height: '32px', background: '#1a1a1a', borderRadius: '6px', marginBottom: '8px', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px' }}>
             <div style={{ width: '12px', height: '12px', background: '#2a2a2a', borderRadius: '2px' }} />
             <div style={{ height: '6px', background: '#2a2a2a', borderRadius: '2px', width: '60%' }} />
          </div>
        ))}
      </div>

    </div>
  );
}
