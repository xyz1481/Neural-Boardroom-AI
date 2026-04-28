import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

export function Particles() {
  return (
    <group>
      <Sparkles 
        count={200} 
        scale={12} 
        size={2} 
        speed={0.4} 
        opacity={0.4} 
        color="#00f3ff" 
      />
      <Sparkles 
        count={50} 
        scale={8} 
        size={4} 
        speed={0.2} 
        opacity={0.2} 
        color="#b026ff" 
      />
    </group>
  );
}
