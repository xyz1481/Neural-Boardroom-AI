import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function UIOverlay({ startSimulation, simulationState, currentInteraction, decision, scenario, currentStepIndex, apiData }) {
  const [inputValue, setInputValue] = useState('');
  const [budget, setBudget] = useState('100000');
  const [activePlan, setActivePlan] = useState(null);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Header */}
      <div className="text-white text-glow text-2xl font-bold tracking-wider opacity-80 backdrop-blur-sm p-4 w-max rounded-xl">
        Boardroom.AI <span className="text-sm font-normal text-neonPurple ml-2 border border-neonPurple px-2 py-0.5 rounded-full">v3.0</span>
      </div>

      {/* Middle section: Chat Log & Timeline */}
      <div className="flex-1 flex items-center px-4 md:px-12 w-full justify-between pointer-events-none pb-20">
        
        {/* Left Side: Timeline */}
        <div className="w-1/4 hidden md:flex flex-col gap-4">
          <AnimatePresence>
            {simulationState !== 'idle' && simulationState !== 'fetching' && scenario.map((step, index) => {
               const isPast = index < currentStepIndex;
               const isCurrent = index === currentStepIndex;
               const isFuture = index > currentStepIndex;
               if (isFuture) return null;

               return (
                 <motion.div 
                   key={index}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={`glass-panel p-3 border-l-4 ${isCurrent ? 'border-neonBlue scale-105 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'border-white/20 opacity-60'}`}
                 >
                   <div className="text-xs uppercase tracking-wide text-white/50">{step.type}</div>
                   <div className="font-bold text-white">{step.agent}</div>
                   <div className="text-xs text-white/70 mt-1 line-clamp-2">{step.text}</div>
                 </motion.div>
               )
            })}
          </AnimatePresence>
        </div>

        {/* Right Side / Center: Current Agent Panel */}
        <div className="w-full md:w-2/3 flex flex-col justify-end items-end gap-3 h-[400px]">

          {/* Plans quick-access tabs (appear once running) */}
          <AnimatePresence>
            {apiData && (simulationState === 'running' || simulationState === 'resolved') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 pointer-events-auto"
              >
                {[
                  { key: 'financial_plan', label: '💰 CFO Plan', color: 'text-neonGreen border-neonGreen' },
                  { key: 'tech_plan',      label: '⚙️ CTO Plan', color: 'text-neonBlue border-neonBlue'  },
                  { key: 'marketing_plan', label: '📣 CMO Plan', color: 'text-pink-400 border-pink-400'  },
                ].map(({ key, label, color }) => apiData[key] && (
                  <button
                    key={key}
                    onClick={() => setActivePlan(activePlan === key ? null : key)}
                    className={`glass-panel px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border ${color} ${activePlan === key ? 'bg-white/10' : 'opacity-60 hover:opacity-100'} transition-all`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded plan detail */}
          <AnimatePresence mode="wait">
            {activePlan && apiData?.[activePlan] && (
              <motion.div
                key={activePlan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel-heavy p-5 max-w-xl w-full border border-white/20 max-h-48 overflow-y-auto pointer-events-auto text-sm text-white/80 leading-relaxed"
              >
                <div className="text-xs uppercase tracking-widest text-white/40 mb-2">{activePlan.replace('_', ' ')}</div>
                {apiData[activePlan]}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Speaking Agent Card */}
           <AnimatePresence mode="wait">
             {currentInteraction && (simulationState === 'running' || simulationState === 'resolved') && (
               <motion.div 
                 key={currentStepIndex}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="glass-panel-heavy p-6 max-w-xl w-full border-t-2 border-neonBlue shadow-[0_0_30px_rgba(0,243,255,0.2)]"
               >
                 <div className="flex items-center gap-3 mb-2">
                   <div className={`w-3 h-3 rounded-full ${simulationState === 'resolved' ? 'bg-neonGreen' : 'bg-neonBlue animate-pulse'}`} />
                   <div className={`${simulationState === 'resolved' ? 'text-neonGreen' : 'text-neonBlue'} font-bold uppercase tracking-wider`}>
                     {currentInteraction.agent} {simulationState === 'resolved' ? 'Resolved' : 'Analyzing...'}
                   </div>
                   <div className="ml-auto text-white/30 text-xs uppercase">{currentInteraction.type}</div>
                 </div>
                 <div className="text-white text-lg leading-relaxed italic">
                   "{currentInteraction.text}"
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
       
      {/* Simulation Controls / Bottom HUD */}
      <div className="pointer-events-auto w-full max-w-4xl mx-auto mb-4">
        <AnimatePresence mode="wait">
          {simulationState === 'idle' ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center focus-within:shadow-[0_0_20px_rgba(176,38,255,0.3)] transition-all border border-white/20"
            >
              <input 
                 type="text" 
                 placeholder="Enter a strategic dilemma (e.g., Pivot to B2B?)" 
                 className="flex-1 w-full bg-transparent text-white outline-none placeholder-white/40 text-lg px-4 border-r border-white/20"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && startSimulation(inputValue || "Pivot to B2B", budget)}
              />
              <div className="flex items-center gap-2 px-4 w-full md:w-auto">
                <span className="text-white/50">$</span>
                <input 
                   type="number"
                   placeholder="Budget" 
                   className="w-32 bg-transparent text-white outline-none placeholder-white/40 text-lg"
                   value={budget}
                   onChange={(e) => setBudget(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && startSimulation(inputValue || "Pivot to B2B", budget)}
                />
              </div>
              <button 
                onClick={() => startSimulation(inputValue || "Pivot to B2B", budget)}
                className="w-full md:w-auto bg-neonPurple/20 text-neonPurple border border-neonPurple px-8 py-3 rounded-xl hover:bg-neonPurple/40 transition-all font-semibold uppercase tracking-wide text-glow whitespace-nowrap"
              >
                Discuss Strategy
              </button>
            </motion.div>
          ) : (
            <motion.div 
               key="status"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex justify-center"
            >
                {simulationState === 'resolved' ? (
                  <button 
                    onClick={() => window.location.reload()}
                    className="glass-panel px-8 py-3 text-white uppercase tracking-widest hover:bg-white/10 transition-colors border border-neonGreen text-neonGreen shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  >
                    Start New Simulation
                  </button>
                ) : (
                  <div className="glass-panel px-6 py-2 text-neonBlue text-sm uppercase tracking-widest flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neonBlue animate-pulse" />
                    {simulationState === 'fetching' ? 'LangGraph Processing Ideas...' : 'Neural Discussion Active'}
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

