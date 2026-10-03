import { HashRouter, Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard.tsx'
import ProtocolPage from './pages/ProtocolPage.tsx'

const motif =
  'repeating-linear-gradient(45deg, var(--color-saffron) 0 6px, transparent 6px 12px)'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-ivory font-sans text-ink">
        <header className="border-b border-saffron/40 bg-ivory-deep">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="h-6 w-6 shrink-0 rounded-sm border border-peacock opacity-70"
              style={{ backgroundImage: motif }}
            />
            <h1 className="text-lg font-semibold tracking-tight">Protocol Visualizer</h1>
          </div>
          <div
            aria-hidden="true"
            className="h-1"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--color-saffron), var(--color-vermilion), var(--color-peacock))',
            }}
          />
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/protocol/:id" element={<ProtocolPage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
