import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import "../index.css"

export default function Landing() {
  const [showCursor, setShowCursor] = useState(true);

  // when typing animation ends, we remove the caret
  const handleAnimationEnd = () => {
    setShowCursor(false);
  };

  return (
    <div
      style={{
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: 40,
      }}
    >
      <h1
        className={`typing ${!showCursor ? 'no-cursor' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        Websites Should Be Simple
      </h1>

      <Link to="/menagerie">
        <button style={{ marginTop: 20, padding: '8px 16px' }}>
          Experiences
        </button>
      </Link>
    </div>
  );
}
