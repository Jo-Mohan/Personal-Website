import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { Color, Fog, Vector3, Euler } from 'three';

// Manual glitch by vertex displacement
function ManualGlitchMesh({ interval = [2, 5], duration = 0.2, strength = 0.3, children }) {
  const meshRef = useRef();
  const [timer, setTimer] = useState(() => Math.random() * (interval[1] - interval[0]) + interval[0]);
  const [glitchTime, setGlitchTime] = useState(0);
  const original = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const arr = meshRef.current.geometry.attributes.position.array;
      original.current = Float32Array.from(arr);
    }
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const posAttr = mesh.geometry.attributes.position;
    const arr = posAttr.array;

    if (glitchTime > 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = original.current[i] + (Math.random() - 0.5) * strength;
      }
      posAttr.needsUpdate = true;
      setGlitchTime(g => g - delta);
      if (glitchTime - delta <= 0) {
        for (let i = 0; i < arr.length; i++) arr[i] = original.current[i];
        posAttr.needsUpdate = true;
      }
    } else {
      setTimer(prev => {
        const next = prev - delta;
        if (next <= 0) {
          setGlitchTime(duration);
          return Math.random() * (interval[1] - interval[0]) + interval[0];
        }
        return next;
      });
    }
  });

  return <mesh ref={meshRef}>{children}</mesh>;
}

// Drag-to-look controls restricted to yaw (left/right) and pitch (up/down)
function DragLookControls() {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const prev = useRef([0, 0]);
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    // Ensure camera is upright and looking forward
    camera.up.set(0, 1, 0);
    camera.lookAt(new Vector3(0, 0, 0));

    const canvas = gl.domElement;
    const onDown = e => { dragging.current = true; prev.current = [e.clientX, e.clientY]; };
    const onMove = e => {
      if (!dragging.current) return;
      const [x0, y0] = prev.current;
      const dx = (e.clientX - x0) * 0.002;
      const dy = (e.clientY - y0) * 0.002;
      prev.current = [e.clientX, e.clientY];

      // update euler from camera quaternion
      euler.current.setFromQuaternion(camera.quaternion);
      // apply yaw & pitch
      euler.current.y -= dx;
      euler.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.current.x - dy));
      // apply back to camera
      camera.quaternion.setFromEuler(euler.current);
    };
    const onUp = () => { dragging.current = false; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [camera, gl]);

  return null;
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 1, 5], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ scene, camera }) => {
          scene.background = new Color('#ffffff');
          scene.fog = new Fog('#ffffff', 5, 15);
          camera.up.set(0, 1, 0);
          camera.lookAt(0, 0, 0);
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

        <DragLookControls />
      </Canvas>
    </div>
  );
}
