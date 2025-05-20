import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'
import { Color, Fog, Vector3, Euler } from 'three'

// Logic to randomly displace vertices for glitch effect
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

// Drag-to-look controls (yaw & pitch only)
function DragLookControls() {
  const { camera, gl } = useThree()
  const dragging = useRef(false)
  const prev = useRef([0, 0])
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    camera.up.set(0, 1, 0)
    camera.lookAt(new Vector3(0, 0, 0))

    const canvas = gl.domElement
    const onDown = e => { dragging.current = true; prev.current = [e.clientX, e.clientY] }
    const onMove = e => {
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
    const onUp = () => (dragging.current = false)

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [camera, gl])

  return null
}

function SkyCracks() {
  const matRef = useRef()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        uniforms={{
          uTime: { value: 0 },
          uPulseFreq: { value: 2.5 },     // faster pulsing
          uCrackScale: { value: 20.0 }    // more frequent cracks
        }}
        vertexShader={
          `varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }`}
        fragmentShader={
          `varying vec3 vPos;
          uniform float uTime;
          uniform float uPulseFreq;
          uniform float uCrackScale;
          float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
          float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i+vec2(1,0));
            float c = hash(i+vec2(0,1));
            float d = hash(i+vec2(1,1));
            vec2 u = f*f*(3.0-2.0*f);
            return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
          }
          void main(){
            float pulse = 0.5 + 0.5 * sin(uTime * uPulseFreq);
            vec2 uv = vPos.xz * uCrackScale;
            float n = noise(uv + uTime * 0.1);
            float cracks = step(0.9, n) * pulse;  // lower threshold for more cracks
            vec3 base = vec3(1.0);
            vec3 crackColor = vec3(0.0);
            gl_FragColor = vec4(mix(base, crackColor, cracks), 1.0);
          }`}
      />
    </mesh>
  )
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

  // Deterministic sparse scatter, avoid collisions and camera
  const randomObjects = React.useMemo(() => {
    let seed = 12345
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    const shapes = ['boxGeometry', 'sphereGeometry', 'cylinderGeometry']
    const objs = []
    const minDist = 1.5
    const cameraPos = [0, 2, 5]
    const minCamDist = 3
    while (objs.length < 40) {
      const type = shapes[Math.floor(rand() * shapes.length)]
      const size = rand() * 0.5 + 0.2
      const args = type === 'sphereGeometry'
        ? [[size,16,16]]
        : type === 'cylinderGeometry'
        ? [[size, size, size*2, 12]]
        : [[size, size, size]]
      const pos = [(rand()-0.5)*40, rand()*3, (rand()-0.5)*40]
      const distCam = Math.hypot(pos[0]-cameraPos[0], pos[1]-cameraPos[1], pos[2]-cameraPos[2])
      if (distCam > minCamDist && objs.every(o => Math.hypot(o.position[0]-pos[0], o.position[2]-pos[2]) > minDist)) {
        objs.push({ key: `rand${objs.length}`, geometryArgs: { geometryType: type, args }, materialProps: { type: 'meshBasic', props: { wireframe: true, color: '#000' } }, position: pos })
      }
    }
    return objs
  }, [])

  const [selected, setSelected] = useState(null)
  const defaultStyle = { left: '50%', top: '50%' }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas style={{ width: '100%', height: '100%', display: 'block' }} camera={{ position: [0,2,5], fov: 60 }} onCreated={({ scene, camera }) => { scene.background = new Color('#fff'); scene.fog = new Fog('#fff',5,15); camera.up.set(0,1,0); camera.lookAt(0,0,0) }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0,10,0]} intensity={1} />
        <SkyCracks />
        <Suspense fallback={null}>
          <Grid cellSize={1} sectionSize={10} infiniteGrid args={[10,10]} color="#e0e0e0" />
          {randomObjects.map(obj => (
            <mesh key={obj.key} position={obj.position}>
              {React.createElement(obj.geometryArgs.geometryType, obj.geometryArgs.args)}
              <meshBasicMaterial {...obj.materialProps.props} />
            </mesh>
          ))}
          {experiences.map(exp => (
            <ObjectGlitch key={exp.id} id={exp.id} position={exp.position} geometryArgs={exp.geometryArgs} materialProps={exp.materialProps} onClick={setSelected} />
          ))}
        </Suspense>
        <DragLookControls />
      </Canvas>
      {selected && (
        <ChatBubble positionStyle={defaultStyle} title={experiences.find(e=>e.id===selected).title} items={experiences.find(e=>e.id===selected).items} onClose={()=>setSelected(null)} />
      )}
    </div>
  )
}
