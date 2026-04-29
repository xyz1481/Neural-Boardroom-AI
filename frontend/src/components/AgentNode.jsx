import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const AGENT_CONFIG = {
  CEO: { color: '#b026ff', label: 'CEO - Strategy' },     // neonPurple
  CTO: { color: '#00f3ff', label: 'CTO - Technology' },   // neonBlue
  CFO: { color: '#39ff14', label: 'CFO - Finance' },      // neonGreen
  CMO: { color: '#ff00dc', label: 'CMO - Marketing' },    // neonPink
  Researcher: { color: '#ffcc00', label: 'DEEP RESEARCHER' }, // Gold
};

export function AgentNode({ role, position, isActive }) {
  const meshRef = useRef();
  const auraRef = useRef();

  const config = AGENT_CONFIG[role] || { color: '#ffffff', label: role };
  const color = new THREE.Color(config.color);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Rotate the inner core slightly
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.z = t * 0.2;
    }

    // Pulse the aura if active
    if (auraRef.current) {
      const targetScale = isActive ? 1.5 + Math.sin(t * 5) * 0.2 : 1.1;
      const targetOpacity = isActive ? 0.8 : 0.2;

      auraRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      auraRef.current.material.opacity = THREE.MathUtils.lerp(auraRef.current.material.opacity, targetOpacity, 0.1);
    }
  });

  return (
    <group position={position}>
      <Float speed={isActive ? 4 : 1.5} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core geometrical representation of the Agent */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 2 : 0.5}
            transparent
            opacity={0.9}
            wireframe={!isActive}
          />
        </mesh>

        {/* Glowing Aura */}
        <mesh ref={auraRef}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Holographic Text Label */}
        <Billboard position={[0, 1.2, 0]}>
          <Text
            fontSize={0.3}
            color={isActive ? '#ffffff' : config.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={isActive ? 1 : 0.7}
            outlineWidth={0.02}
            outlineColor={isActive ? config.color : '#000'}
          >
            {config.label}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}
