import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import { Color, Fog, Vector3, Euler } from 'three'

// Logic to randomly displace vertices to create a glitch effect
function ObjectGlitch({ id, position, geometryArgs, materialProps, interval = [2, 5], duration = 0.2, strength = 0.3, onClick }) {
  const meshRef = useRef()
  const [timer, setTimer] = useState(() => Math.random() * (interval[1] - interval[0]) + interval[0])
  const [glitchTime, setGlitchTime] = useState(0)
  const original = useRef()

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh) {
      original.current = Float32Array.from(mesh.geometry.attributes.position.array)
    }
  }, [])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const posAttr = mesh.geometry.attributes.position
    const arr = posAttr.array

    if (glitchTime > 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = original.current[i] + (Math.random() - 0.5) * strength
      }
      posAttr.needsUpdate = true
      setGlitchTime(g => g - delta)
      if (glitchTime - delta <= 0) {
        for (let i = 0; i < arr.length; i++) arr[i] = original.current[i]
        posAttr.needsUpdate = true
      }
    } else {
      setTimer(prev => {
        const next = prev - delta
        if (next <= 0) {
          setGlitchTime(duration)
          return Math.random() * (interval[1] - interval[0]) + interval[0]
        }
        return next
      })
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(id)}
      cursor="pointer"
    >
      {React.createElement(geometryArgs.geometryType, geometryArgs.args)}
      {materialProps.type === 'meshBasic' ? (
        <meshBasicMaterial {...materialProps.props} />
      ) : (
        <meshStandardMaterial {...materialProps.props} />
      )}
    </mesh>
  )
}

// Drag-to-look controls restricted to yaw & pitch
function DragLookControls() {
  const { camera, gl } = useThree()
  const dragging = useRef(false)
  const prev = useRef([0, 0])
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    camera.up.set(0, 1, 0)
    camera.lookAt(new Vector3(0, 0, 0))

    const canvas = gl.domElement
    const down = e => { dragging.current = true; prev.current = [e.clientX, e.clientY] }
    const move = e => {
      if (!dragging.current) return
      const [x0, y0] = prev.current
      const dx = (e.clientX - x0) * 0.002
      const dy = (e.clientY - y0) * 0.002
      prev.current = [e.clientX, e.clientY]

      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= dx
      euler.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.current.x - dy))
      camera.quaternion.setFromEuler(euler.current)
    }
    const up = () => (dragging.current = false)

    canvas.addEventListener('mousedown', down)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      canvas.removeEventListener('mousedown', down)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [camera, gl])

  return null
}

// Chat bubble overlay
function ChatBubble({ positionStyle, title, items, onClose }) {
  return (
    <div style={{
      position: 'absolute',
      ...positionStyle,
      transform: 'translate(-50%, -50%)',
      background: 'rgba(255,255,255,0.9)',
      border: '2px solid #000',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      color: '#000'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
      </div>
      <ul style={{ margin: '8px 0 0 16px' }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  )
}

export default function App() {
  // Predefined experiences
  const experiences = [
    { id: 'intel', title: 'Intel InfoSec', position: [-2, 1, -1], geometryArgs: { geometryType: 'coneGeometry', args: [[0.5,1,3]] }, materialProps: { type: 'meshStandard', props: { color: '#000' } }, items: ['Intel InfoSec Engineer Internship'] },
    { id: 'capital', title: 'Capital One Quant', position: [1.5,1.5,1], geometryArgs: { geometryType: 'icosahedronGeometry', args: [[0.6,0]] }, materialProps: { type: 'meshBasic', props: { wireframe: true, color: '#000' } }, items: ['Capital One Quant Role'] },
    { id: 'stanford', title: 'Code in Place', position: [3,0.8,-2], geometryArgs: { geometryType: 'coneGeometry', args: [[0.7,1,4]] }, materialProps: { type: 'meshStandard', props: { color: '#000' } }, items: ['Stanford Code in Place Instructor'] }
  ]

  // Deterministic scatter of objects using LCG
  const randomObjects = React.useMemo(() => {
    let seed = 12345
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    const shapes = ['boxGeometry', 'sphereGeometry', 'cylinderGeometry']
    return Array.from({ length: 50 }, (_, i) => {
      const type = shapes[Math.floor(rand() * shapes.length)]
      const size = rand() * 0.5 + 0.2
      const args =
        type === 'sphereGeometry'
          ? [[size, 16, 16]]
          : type === 'cylinderGeometry'
          ? [[size, size, size * 2, 12]]
          : [[size, size, size]]
      return {
        key: `rand${i}`,
        geometryArgs: { geometryType: type, args },
        materialProps: { type: 'meshStandard', props: { color: `hsl(${Math.floor(rand() * 360)},50%,50%)` } },
        position: [(rand() - 0.5) * 20, rand() * 3, (rand() - 0.5) * 20]
      }
    })
  }, [])

  const [selected, setSelected] = useState(null)
  const defaultStyle = { left: '50%', top: '50%' }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 2, 5], fov: 60 }}
        onCreated={({ scene, camera }) => {
          scene.background = new Color('#fff')
          scene.fog = new Fog('#fff', 5, 15)
          camera.up.set(0, 1, 0)
          camera.lookAt(0, 0, 0)
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={1} />
        <Suspense fallback={null}>
          <Grid cellSize={1} sectionSize={10} infiniteGrid args={[10, 10]} color="#e0e0e0" />
          {randomObjects.map(obj => (
            <mesh key={obj.key} position={obj.position}>
              {React.createElement(obj.geometryArgs.geometryType, obj.geometryArgs.args)}
              <meshStandardMaterial {...obj.materialProps.props} />
            </mesh>
          ))}
          {experiences.map(exp => (
            <ObjectGlitch
              key={exp.id}
              id={exp.id}
              position={exp.position}
              geometryArgs={exp.geometryArgs}
              materialProps={exp.materialProps}
              onClick={setSelected}
            />
          ))}
        </Suspense>
        <DragLookControls />
      </Canvas>
      {selected && (
        <ChatBubble
          positionStyle={defaultStyle}
          title={experiences.find(e => e.id === selected).title}
          items={experiences.find(e => e.id === selected).items}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
