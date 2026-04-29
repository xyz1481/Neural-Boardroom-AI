import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function UIOverlay({ startSimulation, simulationState, currentInteraction, decision, scenario, currentStepIndex, apiData }) {
  const [inputValue, setInputValue] = useState('');
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [scenario]);

  const isIdle = simulationState === 'idle';
  const isResolved = simulationState === 'resolved';

  return (
    <div className="hud-layer">
      {/* HEADER WITH RESET */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div style={{ textAlign: 'left' }}>
          <motion.h1 
            animate={{ scale: isIdle ? 1 : 0.6, x: isIdle ? 0 : -20 }}
            className="title-glow"
            style={{ fontSize: isIdle ? '5rem' : '3rem' }}
          >
            BOARDROOM<span style={{ color: 'white' }}>.AI</span>
          </motion.h1>
          <div className="subtitle">Neural Strategic Interface // v5.0</div>
        </div>

        {!isIdle && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-btn"
            style={{ padding: '10px 20px', fontSize: '10px', pointerEvents: 'auto' }}
            onClick={() => window.location.reload()}
          >
            New Session
          </motion.button>
        )}
      </div>

      {/* CENTER ENTRY (IDLE ONLY) */}
      <AnimatePresence>
        {isIdle && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="center-hud"
            style={{ pointerEvents: 'auto' }}
          >
            <input 
              className="cyber-input"
              placeholder="ENTER STRATEGIC OBJECTIVE..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startSimulation(inputValue)}
            />
            <button className="cyber-btn" onClick={() => startSimulation(inputValue || "Expand to Neo-Tokyo")}>
              INITIALIZE NEURAL LINK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE HUD & RESOLUTION */}
      {!isIdle && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: '40px' }}>
          {/* LEFT: PERMANENT TERMINAL */}
          <motion.div 
            animate={{ width: isResolved ? '350px' : '400px' }}
            className="hud-panel"
            style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,242,255,0.1)', fontSize: '10px', fontWeight: '900', color: 'var(--cyan)', letterSpacing: '2px' }}>
              NEURAL_LOG_PERSISTENT
            </div>
            <div ref={terminalRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
              {scenario.map((step, i) => (
                <div key={i} style={{ marginBottom: '15px', opacity: i === currentStepIndex || isResolved ? 1 : 0.4 }}>
                  <span style={{ color: 'var(--cyan)' }}>[{step.agent}]</span> {step.text}
                </div>
              ))}
              {simulationState === 'running' && <div style={{ color: 'var(--cyan)' }}>_ STREAMING_DATA...</div>}
            </div>
          </motion.div>

          {/* RIGHT: RESOLUTION OR ACTIVE CARD */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <AnimatePresence mode="wait">
              {isResolved ? (
                <motion.div 
                  key="resolution"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="hud-panel"
                  style={{ width: '100%', maxWidth: '600px', padding: '40px', border: '1px solid #00ff88' }}
                >
                  <div style={{ color: '#00ff88', fontSize: '10px', fontWeight: '900', letterSpacing: '5px', marginBottom: '15px' }}>STRATEGIC_BLUEPRINT_FINAL</div>
                  <h2 style={{ fontSize: '2rem', margin: '0 0 20px 0', lineHeight: '1.2' }}>{decision?.resolution || "Strategic Optimization Complete"}</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '9px', color: 'var(--cyan)', marginBottom: '5px' }}>MARKET_VIABILITY</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>OPTIMAL</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '9px', color: 'var(--purple)', marginBottom: '5px' }}>EXECUTION_RISK</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>MINIMAL</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '30px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                    The neural boardroom has reached consensus. All agents have submitted their specialized modules for the provided objective.
                  </div>
                </motion.div>
              ) : currentInteraction && (
                <motion.div 
                  key="interaction"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  className="hud-panel"
                  style={{ width: '400px', padding: '30px' }}
                >
                  <div style={{ fontSize: '10px', fontWeight: '900', color: '#7000ff', letterSpacing: '4px', marginBottom: '10px' }}>NEURAL_ACTIVITY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--cyan)', marginBottom: '10px' }}>{currentInteraction.agent}</div>
                  <div style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>"{currentInteraction.text}"</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
