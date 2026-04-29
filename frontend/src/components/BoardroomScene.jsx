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
      shadows
      camera={{ position: [0, 8, 18], fov: 40 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}
    >
      <color attach="background" args={['#020408']} />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.1} />
      <spotLight position={[0, 15, 0]} intensity={3} angle={0.4} penumbra={1} color="#00f3ff" castShadow />
      <pointLight position={[10, 5, 10]} intensity={1} color="#7000ff" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f3ff" />
      
      {/* Agents Array */}
      <AgentNode role="CEO" position={[-4, 1.5, -3]} isActive={activeAgent?.toLowerCase() === 'ceo'} />
      <AgentNode role="CTO" position={[4, 1.5, -3]} isActive={activeAgent?.toLowerCase() === 'cto'} />
      <AgentNode role="CFO" position={[-4, 1.5, 3]} isActive={activeAgent?.toLowerCase() === 'cfo'} />
      <AgentNode role="CMO" position={[4, 1.5, 3]} isActive={activeAgent?.toLowerCase() === 'cmo'} />
      <AgentNode role="Researcher" position={[0, 1.5, -5]} isActive={activeAgent?.toLowerCase() === 'researcher'} />

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
