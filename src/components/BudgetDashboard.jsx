import { useEffect, useMemo, useState } from 'react'

function Stat({ label, value, accent="text-blue-300" }) {
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
      <p className="text-slate-300 text-sm">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent}`}>{value}</p>
    </div>
  )
}

function formatCurrency(n) {
  const num = typeof n === 'number' ? n : parseFloat(n || 0)
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function BudgetDashboard({ accountId, profile }) {
  const [transactions, setTransactions] = useState([])
  const [debts, setDebts] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const txUrl = new URL(`${base}/transactions`)
      txUrl.searchParams.set('account_id', accountId)
      if (profile) txUrl.searchParams.set('profile_id', profile._id)
      const dUrl = new URL(`${base}/debts`)
      dUrl.searchParams.set('account_id', accountId)
      if (profile) dUrl.searchParams.set('profile_id', profile._id)
      const gUrl = new URL(`${base}/goals`)
      gUrl.searchParams.set('account_id', accountId)
      if (profile) gUrl.searchParams.set('profile_id', profile._id)

      const [txRes, dRes, gRes] = await Promise.all([
        fetch(txUrl), fetch(dUrl), fetch(gUrl)
      ])
      const [tx, d, g] = await Promise.all([txRes.json(), dRes.json(), gRes.json()])
      setTransactions(tx)
      setDebts(d)
      setGoals(g)
      setLoading(false)
    }
    if (accountId) load()
  }, [accountId, profile])

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
    const net = income - expenses
    const debtBalance = debts.reduce((s, d) => s + Number(d.balance || 0), 0)
    return { income, expenses, net, debtBalance }
  }, [transactions, debts])

  if (!accountId) return null

  return (
    <section className="relative py-10">
      {loading ? (
        <div className="text-blue-200">Loading data…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Income" value={formatCurrency(totals.income)} />
            <Stat label="Expenses" value={formatCurrency(totals.expenses)} />
            <Stat label="Net" value={formatCurrency(totals.net)} accent={totals.net >= 0 ? 'text-emerald-300' : 'text-rose-300'} />
            <Stat label="Debt Balance" value={formatCurrency(totals.debtBalance)} accent="text-amber-300" />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
              <h3 className="text-slate-100 font-semibold mb-3">Recent Activity</h3>
              <div className="divide-y divide-white/5">
                {transactions.slice(0, 6).map(t => (
                  <div key={t._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-slate-200">{t.category}</p>
                      <p className="text-xs text-slate-400">{new Date(t.date || t.created_at).toLocaleString()}</p>
                    </div>
                    <div className={`font-medium ${t.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-slate-400 text-sm py-6">No transactions yet.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
              <h3 className="text-slate-100 font-semibold mb-3">Goals</h3>
              <div className="space-y-4">
                {goals.slice(0, 5).map(g => {
                  const pct = Math.min(100, Math.round((Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100))
                  return (
                    <div key={g._id}>
                      <div className="flex items-center justify-between">
                        <p className="text-slate-200">{g.title}</p>
                        <p className="text-slate-400 text-sm">{pct}%</p>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</p>
                    </div>
                  )
                })}
                {goals.length === 0 && (
                  <p className="text-slate-400 text-sm py-6">No goals yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default BudgetDashboard
