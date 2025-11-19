import { useState } from 'react'

function QuickAdd({ accountId, profile }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [shared, setShared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${base}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          profile_id: shared ? null : (profile?._id || null),
          type,
          amount: parseFloat(amount),
          category,
          shared,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to add')
      setMessage('Saved!')
      setAmount('')
      setCategory('')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
      <h3 className="text-slate-100 font-semibold mb-3">Quick add</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <select value={type} onChange={e => setType(e.target.value)} className="col-span-2 md:col-span-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-blue-100">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="col-span-2 md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-blue-100" required />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="col-span-2 md:col-span-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-blue-100" required />
        <label className="flex items-center gap-2 col-span-2 md:col-span-1 text-blue-100">
          <input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)} />
          Shared
        </label>
        <button disabled={loading} className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-4 py-2">{loading ? 'Saving…' : 'Add'}</button>
      </div>
      {message && <p className="text-sm mt-2 text-blue-200">{message}</p>}
    </form>
  )
}

export default QuickAdd
