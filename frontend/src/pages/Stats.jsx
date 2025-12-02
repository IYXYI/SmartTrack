import React, { useEffect, useState } from 'react'

export default function Stats() {
  const [stats, setStats] = useState([])

  async function load() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stats</h2>
        <a className="text-sm text-sky-600" href="#/">Back</a>
      </div>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.habitId} className="bg-white p-4 rounded shadow-sm flex justify-between">
            <div>{s.name}</div>
            <div className="font-semibold">Streak: {s.streak}</div>
          </div>
        ))}
        {stats.length === 0 && <div className="text-gray-500">No stats yet.</div>}
      </div>
    </div>
  )
}
