import { redirect } from 'next/navigation'
import Link from 'next/link'
import FixedExpenseForm from './fixed-expense-form'
import FixedExpensesList from './fixed-expenses-list'
import { getCurrentUser } from '@/lib/queries/auth'
import { getFixedExpenses, getExpenseCategories } from '@/lib/queries/expenses'

export default async function FixedExpensesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get all fixed expenses
  const fixedExpenses = await getFixedExpenses(user.id)

  // Get categories for the form
  const categories = await getExpenseCategories(user.id)

  // Calculate total monthly fixed expenses
  const totalFixed = fixedExpenses
    ?.filter(exp => exp.is_active)
    .reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0

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
              Gastos Fijos
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total mensual</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              ${totalFixed.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Agregar Gasto Fijo
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Los gastos fijos se cobran automáticamente el día especificado de cada mes.
            </p>
            <FixedExpenseForm categories={categories || []} />
          </div>

          {/* List Section */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Mis Gastos Fijos
            </h2>
            <FixedExpensesList expenses={fixedExpenses || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
