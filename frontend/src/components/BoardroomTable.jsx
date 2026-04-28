import React from 'react';

export function BoardroomTable() {
  return (
    <group position={[0, -1, 0]}>
      {/* Central Glass Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshPhysicalMaterial 
          color="#001122" 
          transparent 
          opacity={0.4} 
          roughness={0.1}
          transmission={0.9} // Glass-like
          thickness={0.5}
        />
      </mesh>

      {/* Glowing Edge/Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} />
      </mesh>

      {/* Pedestal/Base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[1, 2, 2, 32]} />
        <meshStandardMaterial 
          color="#0a0a0f" 
          roughness={0.8}
          wireframe={true}
        />
      </mesh>
      
      {/* Floor reflection grid */}
      <gridHelper args={[20, 20, '#00f3ff', '#111']} position={[0, -2, 0]} />
    </group>
  );
}
