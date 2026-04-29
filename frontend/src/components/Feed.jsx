import React, { useState } from 'react';

export function Feed({ simulationState, scenario, startSimulation, objective }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startSimulation(inputValue);
    }
  };

  if (simulationState === 'idle') {
    return (
      <div className="idle-container">
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '48px', letterSpacing: '-1px' }}>Boardroom AI</h1>
        
        <div className="perplexity-input-box">
          <textarea 
            className="input-field"
            placeholder="Define your strategic objective..."
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="input-footer">
            <div style={{ display: 'flex', gap: '16px', color: '#5a5a5a', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <span>Attach</span> <span>Web Search</span> <span>Analysis</span>
            </div>
            <button className="submit-btn" onClick={() => startSimulation(inputValue)}>
              →
            </button>
          </div>
        </div>

        <div className="chips-container">
          {["Launch a SaaS product", "Go to market strategy", "Startup idea validation"].map(s => (
            <div key={s} className="chip" onClick={() => { setInputValue(s); startSimulation(s); }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="running-feed">
      <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '48px' }}>{objective}</h2>
      
      {scenario.map((msg, index) => (
        <div key={index} className="agent-block">
          <span className="agent-tag">{msg.agent} Insight</span>
          <div className="agent-text">{msg.text}</div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '24px', color: '#5a5a5a', fontSize: '12px', fontWeight: 'bold' }}>
            <span style={{ cursor: 'pointer' }}>Share</span>
            <span style={{ cursor: 'pointer' }}>Rewrite</span>
            <span style={{ cursor: 'pointer' }}>Copy</span>
          </div>
        </div>
      ))}

      {simulationState === 'running' && (
        <div style={{ color: '#5a5a5a', fontSize: '14px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
          Searching and analyzing context...
        </div>
      )}

      {/* Sticky Bottom Follow-up */}
      <div className="sticky-footer">
        <div className="perplexity-input-box" style={{ maxWidth: '720px', padding: '12px 16px', boxShadow: 'none' }}>
           <input 
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', width: '100%' }}
            placeholder="Ask a follow-up question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
           />
        </div>
      </div>
    </div>
  );
}
