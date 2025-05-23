// src/components/MenagerieCarousel.jsx
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import { Color, Fog } from 'three'

function ChatBubble({ positionStyle, title, items, onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255,255,255,0.9)',
        border: '2px solid #000',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '300px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        color: '#000',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>
      <ul style={{ margin: '8px 0 0 16px' }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  )
}

export default function MenagerieCarousel() {
  // placeholder experiences
 const experiences = [
  {
    id: 'square',
    title: 'Square',
    // This <boxGeometry/> + <meshStandardMaterial/> combo renders a black cube
    geometry: (<boxGeometry args={[1, 1, 1]} />),
    material: (<meshStandardMaterial color="#000000" />),
    items: ['This is a square placeholder']
  },
  {
    id: 'triangle',
    title: 'Triangle Prism',
    // This <coneGeometry/> + <meshStandardMaterial/> combo renders a black triangular prism
    geometry: (<coneGeometry args={[1, 1, 3]} />),
    material: (<meshStandardMaterial color="#000000" />),
    items: ['This is a triangular placeholder']
  }
];


  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const exp = experiences[currentIndex]

  const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '2rem',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid #000',
    borderRadius: '4px',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    zIndex: 10
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Left arrow */}
      <button
        style={{ ...arrowStyle, left: 20 }}
        onClick={() =>
          setCurrentIndex(
            (i) => (i - 1 + experiences.length) % experiences.length
          )
        }
      >
        ◀
      </button>

      {/* Right arrow */}
      <button
        style={{ ...arrowStyle, right: 20 }}
        onClick={() =>
          setCurrentIndex((i) => (i + 1) % experiences.length)
        }
      >
        ▶
      </button>

      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.5, 5], fov: 60 }}
        onCreated={({ scene, camera }) => {
          scene.background = new Color('#ffffff')
          scene.fog = new Fog('#ffffff', 5, 15)
          camera.lookAt(0, 0, 0)
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={1} />

        {/* Floor grid */}
        <Grid
          cellSize={1}
          sectionSize={10}
          infiniteGrid
          args={[10, 10]}
          position={[0, 0, 0]}
          color="#e0e0e0"
        />

        {/* Placeholder “character” */}
     <mesh
  position={[0, 1, 0]}
  scale={[2, 2, 2]}
  onClick={() => setSelected(exp.id)}
  cursor="pointer"
>
  {exp.geometry}
  {exp.material}
</mesh>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>

      {/* Details overlay */}
      {selected === exp.id && (
        <ChatBubble
          positionStyle={{ left: '50%', top: '25%' }}
          title={exp.title}
          items={exp.items}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
