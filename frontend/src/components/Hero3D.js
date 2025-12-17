import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function RotatingMesh(props) {
  const ref = useRef();
  useFrame((state, delta) => (ref.current.rotation.y += delta * 0.4));
  return (
    <mesh ref={ref} {...props} castShadow receiveShadow>
      <icosahedronGeometry args={[1.2, 2]} />
      <meshStandardMaterial color={'#8b5cf6'} roughness={0.3} metalness={0.6} />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-80 lg:h-96 relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <RotatingMesh position={[0, 0, 0]} />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-start pl-6 lg:pl-20">
        <div className="text-white z-10">
          <h2 className="text-2xl lg:text-4xl font-extrabold">Tamil Nadu Mine Risk Dashboard</h2>
          <p className="mt-2 text-white/90 max-w-lg">Interactive AI rockfall risk visualizations — explore mines with fluid interactions.</p>
        </div>
      </div>
    </div>
  );
}
