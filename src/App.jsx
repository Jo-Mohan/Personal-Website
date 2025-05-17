import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Grid } from '@react-three/drei';
import { Color, Fog } from 'three';
import { EffectComposer, Glitch } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';

export default function App() {
  // refs to the meshes we want to glitch
  const prismRef = useRef();
  const polyRef  = useRef();

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ scene }) => {
          scene.background = new Color('#ffffff');
          scene.fog        = new Fog('#ffffff', 5, 15);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={1} />

        <Suspense fallback={null}>
          {/* Infinite white grid floor */}
          <Grid
            cellSize={1}
            sectionSize={10}
            infiniteGrid
            args={[10, 10]}
            position={[0, 0, 0]}
            color="#e0e0e0"
          />

          {/* Glitch targets */}
          <mesh ref={prismRef} position={[-2, 1, -1]}>  
            <coneGeometry args={[0.5, 1, 3]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh ref={polyRef} position={[1.5, 1.5, 1]} rotation={[0.4, 0.2, 0]}> 
            <icosahedronGeometry args={[0.6, 0]} />
            <meshBasicMaterial wireframe color="#000000" />
          </mesh>

          {/* Static pyramid */}
          <mesh position={[3, 0.8, -2]}> 
            <coneGeometry args={[0.7, 1, 4]} />
            <meshStandardMaterial color="#000000" />
          </mesh>

          {/* Postprocessing glitch on specific refs */}
          <EffectComposer multisampling={0}>
            <Glitch
              target={[prismRef.current, polyRef.current]}
              delay={[1, 3]}
              duration={[0.3, 0.6]}
              strength={[0.5, 1.0]}
              mode={GlitchMode.SPORADIC}
            />
          </EffectComposer>
        </Suspense>

        {/* First-person look-only controls */}
        <PointerLockControls />
      </Canvas>
    </div>
  );
}
