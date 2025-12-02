import React, { useEffect, useState } from 'react'
import Home from './pages/Home'
import AddHabit from './pages/AddHabit'
import Stats from './pages/Stats'

const routes = {
  '': Home,
  '#/': Home,
  '#/add': AddHabit,
  '#/stats': Stats,
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const View = routes[hash] || Home

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">SmartTrack</h1>
          <nav className="space-x-3">
            <a className="text-sm text-sky-600" href="#/">Home</a>
            <a className="text-sm text-sky-600" href="#/add">Add Habit</a>
            <a className="text-sm text-sky-600" href="#/stats">Stats</a>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <View />
      </main>
    </div>
  )
}
