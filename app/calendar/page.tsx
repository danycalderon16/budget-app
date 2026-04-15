import { redirect } from 'next/navigation'
import Link from 'next/link'
import CalendarView from './calendar-view'
import { getCurrentUser } from '@/lib/queries/auth'
import { getIncomeSources, getIncomeTransactions } from '@/lib/queries/income'
import { getActiveFixedExpenses, getVariableExpenses } from '@/lib/queries/expenses'

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get current month data
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const firstDayStr = firstDay.toISOString().split('T')[0]
  const lastDayStr = lastDay.toISOString().split('T')[0]

  // Get income sources
  const incomeSources = await getIncomeSources(user.id)

  // Get fixed expenses
  const fixedExpenses = await getActiveFixedExpenses(user.id)

  // Get variable expenses for current month
  const variableExpenses = await getVariableExpenses(user.id, firstDayStr, lastDayStr)

  // Get income transactions for current month
  const incomeTransactions = await getIncomeTransactions(user.id, firstDayStr, lastDayStr)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link 
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              ← Volver al Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Calendario Financiero
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <CalendarView
          incomeSources={incomeSources ?? []}
          fixedExpenses={fixedExpenses ?? []}
          variableExpenses={variableExpenses ?? []}
          incomeTransactions={incomeTransactions ?? []}
        />
      </main>
    </div>
  )
}
