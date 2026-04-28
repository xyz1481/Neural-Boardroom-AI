import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BoardroomTable } from './BoardroomTable';
import { AgentNode } from './AgentNode';
import { Particles } from './Particles';
import { DecisionHologram } from './DecisionHologram';

export function BoardroomScene({ activeAgent, simulationState, decision }) {
  return (
    <Canvas
      camera={{ position: [0, 5, 12], fov: 45 }}
      gl={{
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default',
        antialias: true,
      }}
      dpr={[1, 1]}
      onCreated={({ gl }) => {
        gl.setClearColor('#050508');
      }}
    >
      <color attach="background" args={['#050508']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} color="#00f3ff" />
      
      {/* Agents Array */}
      <AgentNode role="CEO" position={[-4, 1.5, -3]} isActive={activeAgent === 'CEO'} />
      <AgentNode role="CTO" position={[4, 1.5, -3]} isActive={activeAgent === 'CTO'} />
      <AgentNode role="CFO" position={[-4, 1.5, 3]} isActive={activeAgent === 'CFO'} />
      <AgentNode role="CMO" position={[4, 1.5, 3]} isActive={activeAgent === 'CMO'} />

      <BoardroomTable />
      
      {simulationState === 'resolved' && <DecisionHologram decision={decision} />}
      
      <Particles />

      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={8}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
