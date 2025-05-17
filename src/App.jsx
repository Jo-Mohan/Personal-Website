import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Grid } from '@react-three/drei';
import { Color, Fog } from 'three';

// Manual glitch by vertex displacement
function ManualGlitchMesh({ interval = [2, 5], duration = 0.2, strength = 0.3, children }) {
  const meshRef = useRef();
  const [timer, setTimer] = useState(() => Math.random() * (interval[1] - interval[0]) + interval[0]);
  const [glitchTime, setGlitchTime] = useState(0);
  const originalPositions = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const posAttr = meshRef.current.geometry.attributes.position;
      originalPositions.current = Float32Array.from(posAttr.array);
    }
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const posAttr = mesh.geometry.attributes.position;
    const arr = posAttr.array;

    if (glitchTime > 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = originalPositions.current[i] + (Math.random() - 0.5) * strength;
      }
      posAttr.needsUpdate = true;
      setGlitchTime(g => g - delta);
      if (glitchTime - delta <= 0) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = originalPositions.current[i];
        }
        posAttr.needsUpdate = true;
      }
    } else {
      setTimer(t => {
        const t2 = t - delta;
        if (t2 <= 0) {
          setGlitchTime(duration);
          return Math.random() * (interval[1] - interval[0]) + interval[0];
        }
        return t2;
      });
    }
  });

  return <mesh ref={meshRef}>{children}</mesh>;
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ scene }) => {
          scene.background = new Color('#ffffff');
          scene.fog = new Fog('#ffffff', 5, 15);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={1} />

        <Suspense fallback={null}>
          {/* Infinite white grid floor */}
          <Grid cellSize={1} sectionSize={10} infiniteGrid args={[10, 10]} position={[0, 0, 0]} color="#e0e0e0" />

          {/* Triangle prism with manual glitch */}
          <ManualGlitchMesh interval={[1, 3]} duration={0.3} strength={0.4}>
            <coneGeometry args={[0.5, 1, 3]} />
            <meshStandardMaterial color="#000000" />
          </ManualGlitchMesh>

          {/* Static wireframe polyhedron */}
          <mesh position={[1.5, 1.5, 1]} rotation={[0.4, 0.2, 0]}> 
            <icosahedronGeometry args={[0.6, 0]} />
            <meshBasicMaterial wireframe color="#000000" />
          </mesh>

          {/* Static pyramid */}
          <mesh position={[3, 0.8, -2]}> 
            <coneGeometry args={[0.7, 1, 4]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </Suspense>

        {/* First-person look controls */}
        <PointerLockControls />
      </Canvas>
    </div>
  );
}
