import React from 'react'
import { Link } from 'react-router-dom'
import MenagerieCarousel from '../components/MenagerieCarousel'

export default function Menagerie() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          textDecoration: 'none',
          color: '#000'
        }}
      >
        ← Back
      </Link>
      <MenagerieCarousel />
    </div>
  )
}
