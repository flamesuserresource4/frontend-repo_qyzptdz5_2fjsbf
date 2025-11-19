import { useEffect, useState } from 'react'

function ProfileSwitcher({ accountId, onChange }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${base}/profiles${accountId ? `?account_id=${accountId}` : ''}`)
        const data = await res.json()
        setProfiles(data)
        setLoading(false)
      } catch (e) {
        setError('Failed to load profiles')
        setLoading(false)
      }
    }
    load()
  }, [accountId])

  if (loading) return <div className="text-sm text-blue-200">Loading profiles…</div>
  if (error) return <div className="text-sm text-red-300">{error}</div>

  return (
    <div className="flex flex-wrap gap-2">
      {profiles.map((p) => (
        <button
          key={p._id}
          onClick={() => onChange && onChange(p)}
          className="px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-blue-100 border border-white/10"
        >
          <span className="mr-1">{p.emoji || '👤'}</span>
          {p.name}
        </button>
      ))}
    </div>
  )
}

export default ProfileSwitcher