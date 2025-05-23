import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Menagerie from './pages/Menagerie'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/menagerie" element={<Menagerie />} />
      </Routes>
    </BrowserRouter>
  )
}
