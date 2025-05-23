import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Your Name</h1>
      
      <Link to="/menagerie">
        <button style={{ marginTop: 20, padding: '8px 16px' }}>
          Enter Menagerie
        </button>
      </Link>
    </div>
  )
}
