import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has completed setup
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!settings) {
    redirect('/setup')
  }

  // Get current budget period
  const today = new Date().toISOString().split('T')[0]
  const { data: currentPeriod } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('user_id', user.id)
    .lte('start_date', today)
    .gte('end_date', today)
    .single()

  // Get next income payment
  const { data: nextIncome } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('next_payment_date', { ascending: true })
    .limit(1)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <form>
            <button
              formAction={logout}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Period Card */}
          {currentPeriod && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Período Actual
              </h2>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                ${currentPeriod.remaining.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Disponible de ${currentPeriod.total_budget.toFixed(2)}
              </p>
              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                {new Date(currentPeriod.start_date).toLocaleDateString('es-MX')} - {new Date(currentPeriod.end_date).toLocaleDateString('es-MX')}
              </div>
            </div>
          )}

          {/* Next Income Card */}
          {nextIncome && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Próximo Pago
              </h2>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                ${nextIncome.amount.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {nextIncome.name}
              </p>
              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                {nextIncome.next_payment_date ? new Date(nextIncome.next_payment_date).toLocaleDateString('es-MX') : 'No definido'}
              </div>
            </div>
          )}

          {/* User Info Card */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Usuario
            </h2>
            <p className="mt-2 text-sm text-zinc-900 dark:text-zinc-50">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Presupuesto por defecto: ${settings.default_variable_budget.toFixed(2)}
            </p>
          </div>
        </div>

        {!currentPeriod && (
          <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No hay un período activo. El sistema creará uno automáticamente en tu próxima fecha de pago.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
