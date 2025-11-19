import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import ProfileSwitcher from './components/ProfileSwitcher'
import BudgetDashboard from './components/BudgetDashboard'
import QuickAdd from './components/QuickAdd'

function App() {
  const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [account, setAccount] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Bootstraps a demo account on first load to make the app interactive immediately
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true)
      // Try to find any account; if none, create one with two demo profiles
      const accountsRes = await fetch(`${base}/accounts`)
      const accounts = await accountsRes.json()
      let acc = accounts[0]
      if (!acc) {
        const createRes = await fetch(`${base}/accounts`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Household Budget', email: 'home@example.com' })
        })
        const { id } = await createRes.json()
        acc = { _id: id, name: 'Household Budget' }
        // create two profiles
        await fetch(`${base}/profiles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: id, name: 'Alex', emoji: '🧑🏻‍💻', color: '#3b82f6' }) })
        await fetch(`${base}/profiles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: id, name: 'Sam', emoji: '🧑🏽‍🍳', color: '#f97316' }) })
        // seed a couple transactions
        await fetch(`${base}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: id, type: 'income', amount: 4500, category: 'Salary', shared: true }) })
        await fetch(`${base}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: id, type: 'expense', amount: 120, category: 'Groceries', shared: true }) })
      }
      setAccount(acc)
      setLoading(false)
    }
    bootstrap()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Hero />

      <main className="container mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{account ? account.name : 'Loading account…'}</h2>
              <p className="text-blue-200/80">Switch profiles to see shared and personal budgets.</p>
            </div>
            {account && (
              <ProfileSwitcher accountId={account._id} onChange={setProfile} />
            )}
          </div>

          {account && (
            <div className="mt-6 space-y-6">
              <QuickAdd accountId={account._id} profile={profile} />
              <BudgetDashboard accountId={account._id} profile={profile} />
            </div>
          )}

          {!account && (
            <div className="py-10 text-blue-200">{loading ? 'Setting up your space…' : 'No account found'}</div>
          )}
        </div>

        <footer className="text-center text-blue-300/60 text-sm mt-10 pb-10">
          Built for modern households • Multi-profile budgeting
        </footer>
      </main>
    </div>
  )
}

export default App
