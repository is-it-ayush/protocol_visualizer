import { HashRouter, Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard.tsx'
import ProtocolPage from './pages/ProtocolPage.tsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/protocol/:id" element={<ProtocolPage />} />
      </Routes>
    </HashRouter>
  )
}
