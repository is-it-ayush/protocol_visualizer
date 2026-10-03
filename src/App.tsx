import { HashRouter, Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard.tsx'
import ProtocolPage from './pages/ProtocolPage.tsx'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/protocol/:id" element={<ProtocolPage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
