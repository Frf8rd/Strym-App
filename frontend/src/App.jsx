import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
function Logout() {
  localStorage.removeItem('user')
  return <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App