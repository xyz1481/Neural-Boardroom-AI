import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { ContextPanel } from './components/ContextPanel';
import { LocusCheckout } from '@withlocus/checkout-react';

function App() {
  const [simulationState, setSimulationState] = useState('idle');
  const [scenario, setScenario] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [objective, setObjective] = useState("");
  const [tokenUsage, setTokenUsage] = useState({ tokens: 0, cost: 0 });
  const [locusSessionId, setLocusSessionId] = useState(null);

  const startCheckout = async (inputObjective) => {
    if (!inputObjective) return;
    setObjective(inputObjective);
    
    try {
      const response = await fetch('http://localhost:8000/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: inputObjective }),
      });
      const data = await response.json();
      if (data.sessionId) {
        setLocusSessionId(data.sessionId);
        // If it's a test session (placeholder key), we auto-success for dev convenience
        if (data.sessionId.startsWith('test_session')) {
          setTimeout(() => {
             setLocusSessionId(null);
             runSimulation(inputObjective);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Checkout creation failed:", error);
    }
  };

  const runSimulation = async (inputObjective) => {
    setSimulationState('running');
    setScenario([]);
    setActiveAgents([]);
    setLocusSessionId(null); // Clear checkout UI
    
    try {
      const response = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: inputObjective }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'step') {
                setScenario(prev => [...prev, data]);
                if (!activeAgents.includes(data.agent)) {
                  setActiveAgents(prev => [...prev, data.agent]);
                }
                // Auto-resolve if CEO gives final insight
                if (data.agent === 'CEO') {
                  setSimulationState('resolved');
                }
              } else if (data.type === 'final') {
                setSimulationState('resolved');
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationState('idle');
    }
  };

  return (
    <div className="app-container">
      {/* 1. Left Sidebar */}
      <Sidebar 
        onNewSession={() => {
          setSimulationState('idle');
          setScenario([]);
          setObjective("");
        }}
      />

      {/* 2. Main Experience */}
      <main className="main-content">
        <Feed 
          simulationState={simulationState} 
          scenario={scenario} 
          startSimulation={startCheckout}
          objective={objective}
        />
      </main>

      {/* 3. Right Context Panel */}
      <aside className="right-context-panel">
        <ContextPanel 
          objective={objective} 
          activeAgents={activeAgents} 
          tokenUsage={tokenUsage}
          simulationState={simulationState}
        />
      </aside>

      {/* Locus Checkout Overlay */}
      {locusSessionId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#111111', borderRadius: '16px', border: '1px solid #2a2a2a', overflow: 'hidden', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Neural Payment Required
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', margin: 0 }}>Authorize Boardroom</h2>
              <p style={{ fontSize: '14px', color: '#5a5a5a', marginTop: '8px' }}>Pay 5.00 USDC to activate the neural deliberation chain.</p>
            </div>
            
            {locusSessionId.startsWith('test_session') ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#3b82f6' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
                  DEVELOPER MODE: AUTOMATING PAYMENT...
                </div>
              </div>
            ) : (
              <LocusCheckout
                sessionId={locusSessionId}
                checkoutUrl="https://beta-checkout.paywithlocus.com"
                onSuccess={() => runSimulation(objective)}
                mode="embedded"
              />
            )}

            <button 
              onClick={() => setLocusSessionId(null)}
              style={{ width: '100%', marginTop: '24px', background: 'transparent', border: 'none', color: '#5a5a5a', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
