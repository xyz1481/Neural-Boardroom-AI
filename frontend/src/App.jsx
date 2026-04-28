import React, { useState } from 'react';
import { BoardroomScene } from './components/BoardroomScene.jsx';
import { UIOverlay } from './components/UIOverlay.jsx';

function App() {
  const [simulationState, setSimulationState] = useState('idle'); // idle, fetching, running, resolved
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [decision, setDecision] = useState(null);
  const [scenario, setScenario] = useState([]);
  const [apiData, setApiData] = useState(null);

  const startSimulation = async (topic, budget) => {
    setSimulationState('fetching');
    setCurrentStepIndex(-1);
    setDecision(null);
    setScenario([]);
    setApiData(null);
    
    try {
      const response = await fetch('/api/run-startup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: topic, budget: parseFloat(budget) || 100000 })
      });
      const result = await response.json();

      if (result.success && result.data.steps.length > 0) {
        setScenario(result.data.steps);
        setApiData(result.data);  // store full data for plan detail panels
        setSimulationState('running');
        setCurrentStepIndex(0);
        
        let step = 0;
        const interval = setInterval(() => {
          step++;
          if (step < result.data.steps.length) {
            setCurrentStepIndex(step);
          } else {
            clearInterval(interval);
            setSimulationState('resolved');
            setDecision(result.data.decision);
          }
        }, 4000);
      } else {
        console.error("Simulation failed:", result);
        setSimulationState('idle');
        alert("Failed to run simulation. Check backend logs.");
      }
    } catch(err) {
        console.error("API error:", err);
        setSimulationState('idle');
        alert("Error connecting to backend API.");
    }
  };

  const currentInteraction = currentStepIndex >= 0 && scenario.length > 0 ? scenario[currentStepIndex] : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-boardroomDark">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <BoardroomScene 
          activeAgent={currentInteraction?.agent} 
          simulationState={simulationState}
          decision={decision}
        />
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
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
