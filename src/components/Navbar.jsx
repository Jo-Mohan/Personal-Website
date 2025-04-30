import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '60px',
    background: 'rgba(15, 15, 30, 0.9)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    zIndex: 1000,
  }

  const ulStyle = {
    listStyle: 'none',
    display: 'flex',
    gap: '2rem',
    margin: 0,
    padding: 0,
  }

  const linkStyle = {
    textDecoration: 'none',
    color: '#ccc',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'color 0.2s ease',
  }

  const activeStyle = {
    ...linkStyle,
    color: '#00bfff',
    fontWeight: 600,
    borderBottom: '2px solid #00bfff',
    paddingBottom: '2px',
  }

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li><Link to="/" style={pathname === '/' ? activeStyle : linkStyle}>Home</Link></li>
        <li><Link to="/resume" style={pathname === '/resume' ? activeStyle : linkStyle}>Resume</Link></li>
        <li><Link to="/experiences" style={pathname === '/experiences' ? activeStyle : linkStyle}>Experiences</Link></li>
        <li><Link to="/projects" style={pathname === '/projects' ? activeStyle : linkStyle}>Projects</Link></li>
        <li><Link to="/about" style={pathname === '/about' ? activeStyle : linkStyle}>About Me</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
