import React, { useState } from 'react'

export default function AddHabit() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      if (!res.ok) throw new Error('failed')
      setMsg('Habit added')
      setName('')
      setTimeout(() => setMsg(null), 2000)
    } catch (err) {
      console.error(err)
      setMsg('Error saving')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-2">Add Habit</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            className="w-full p-3 rounded border"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-sky-600 text-white rounded" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <a className="text-sm text-gray-500" href="#/">Back</a>
        </div>
        {msg && <div className="text-sm text-gray-600">{msg}</div>}
      </form>
    </div>
  )
}
