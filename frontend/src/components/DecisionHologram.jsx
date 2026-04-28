import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';

export function DecisionHologram({ decision }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2 + 2;
    }
  });

  if (!decision) return null;

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 0.1, 4, 32]} />
          <meshBasicMaterial 
            color="#00f3ff" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
        
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.4}
          color="#00f3ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000"
        >
          {decision.summary}
        </Text>

        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          textAlign="center"
        >
          {`Tradeoffs:\n${decision.tradeoffs.join('\n')}\n\nPlan:\n${decision.actionPlan}`}
        </Text>
      </Float>
    </group>
  );
}
