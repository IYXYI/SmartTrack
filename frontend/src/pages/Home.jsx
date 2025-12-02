import React, { useEffect, useState } from 'react'

function HabitItem({ h, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
      <div>
        <div className="font-medium">{h.name}</div>
        <div className="text-xs text-gray-500">Created: {new Date(h.created_at).toLocaleDateString()}</div>
      </div>
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={!!h.completedToday}
            onChange={() => onToggle(h.id)}
            className="form-checkbox h-5 w-5 text-sky-600"
          />
        </label>
      </div>
    </div>
  )
}

export default function Home() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/habits')
      const data = await res.json()
      setHabits(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 3000) // polling every 3s
    return () => clearInterval(id)
  }, [])

  async function toggle(id) {
    try {
      await fetch('/api/habits/' + id, { method: 'PATCH' })
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Habits</h2>
        <a className="text-sm text-sky-600" href="#/add">+ Add</a>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      <div className="space-y-3">
        {habits.length === 0 && !loading && <div className="text-gray-500">No habits yet.</div>}
        {habits.map((h) => (
          <HabitItem key={h.id} h={h} onToggle={toggle} />
        ))}
      </div>
    </div>
  )
}
