import { useState } from 'react'

const experiences = [
  {
    id: 1,
    title: 'Intel Internship',
    image: '/intel.png',
    description: 'Worked on ML models for chip design.',
    achievements: ['Internship Offer', 'Chip optimizer deployed'],
    preview: '/intel-preview.png',
    tech: ['Python', 'TensorFlow', 'Jupyter'],
    link: 'https://intel.com',
  },
  {
    id: 2,
    title: 'Trading Bot',
    image: '/trading.png',
    description: 'Built AI trading bot with latency < 1ms.',
    achievements: ['Bot live tested', 'Top 3% IMC comp'],
    preview: '/trading-preview.png',
    tech: ['C++', 'PyTorch', 'Pandas'],
    link: 'https://github.com/jomoh/trading-bot',
  },
  // Add more experiences here
]

function ExperienceGallery() {
  const [selected, setSelected] = useState(experiences[0])

  const infoBoxStyle = {
    minWidth: '300px',
    maxWidth: '300px',
    height: '300px', // fixed height
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.03)',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#ccc',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  }
  

  return (
    <div style={{ paddingTop: '80px' }}>
      {/* Game Tile Row */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        padding: '1rem 2rem',
      }}>
        {experiences.map(exp => (
          <div
            key={exp.id}
            onClick={() => setSelected(exp)}
            style={{
              width: '200px',
              height: '200px',
              backgroundImage: `url(${exp.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px',
              border: exp.id === selected.id ? '3px solid #00bfff' : '1px solid #333',
              transform: exp.id === selected.id ? 'scale(1.1)' : 'scale(1)',
              transition: '0.2s ease',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      {/* Section Title */}
      <div style={{ padding: '0 2rem' }}>
        <h2 style={{ color: 'white' }}>{selected.title}</h2>
      </div>

      {/* Info Box Row */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        marginTop: '1rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '1rem 2rem',
        width: '100%',
      }}>
        {/* Description Box */}
        <div style={infoBoxStyle}>
          <h3>Description</h3>
          <p>{selected.description}</p>
        </div>

        {/* Preview Image Box */}
        <div style={infoBoxStyle}>
          <h3>Preview</h3>
          <img
            src={selected.preview}
            alt="Preview"
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>

        {/* Achievements Box */}
        <div style={infoBoxStyle}>
          <h3>Achievements</h3>
          <ul>
            {selected.achievements.map((a, i) => <li key={i}>🏆 {a}</li>)}
          </ul>
        </div>

        {/* Tech + Link Box */}
        <div style={infoBoxStyle}>
          <h3>Tech Stack</h3>
          <ul>
            {selected.tech.map((t, i) => <li key={i}>🧠 {t}</li>)}
          </ul>
          <a
            href={selected.link}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: '0.5rem', display: 'inline-block', color: '#00bfff' }}
          >
            Visit Project →
          </a>
        </div>
      </div>
    </div>
  )
}

export default ExperienceGallery
