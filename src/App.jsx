import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Resume from './pages/Resume'
import Experiences from './pages/Experiences'
import Projects from './pages/Projects'
import About from './pages/About'

function App() {
  return (
    <main style={{ marginLeft: '60px', padding: '2rem' }}>
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
    </main>
  )
}

export default App
