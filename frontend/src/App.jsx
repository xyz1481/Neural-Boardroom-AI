import React, { useState, useEffect } from 'react';
import { BoardroomScene } from './components/BoardroomScene.jsx';
import { UIOverlay } from './components/UIOverlay.jsx';

function App() {
  const [simulationState, setSimulationState] = useState('idle'); // idle, fetching, running, resolved
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [decision, setDecision] = useState(null);
  const [scenario, setScenario] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [apiData, setApiData] = useState(null);

  const startSimulation = async (objective) => {
    setSimulationState('fetching');
    setScenario([]);
    setCurrentStepIndex(-1);
    setDecision(null);
    setActiveAgent(null);

    try {
      const response = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setSimulationState('running');

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
                setCurrentStepIndex(prev => prev + 1);
                setActiveAgent(data.agent);
              } else if (data.type === 'final') {
                setDecision(data.decision);
                setApiData(data.api_data);
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

  const currentInteraction = currentStepIndex >= 0 && scenario.length > 0 ? scenario[currentStepIndex] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020408]">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <BoardroomScene 
          simulationState={simulationState} 
          currentInteraction={currentInteraction}
          activeAgent={activeAgent}
        />
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <UIOverlay 
          startSimulation={startSimulation}
          simulationState={simulationState}
          currentInteraction={currentInteraction}
          decision={decision}
          scenario={scenario}
          currentStepIndex={currentStepIndex}
          apiData={apiData}
        />
      </div>
    </div>
  );
}

export default App;
