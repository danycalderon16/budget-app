import { redirect } from 'next/navigation'
import { logout } from './actions'
import DashboardClient from './dashboard-client'
import { getCurrentUser } from '@/lib/queries/auth'
import { getUserSettings, getCurrentBudgetPeriod } from '@/lib/queries/budget'
import { getNextIncomePayment } from '@/lib/queries/income'
import { getActiveFixedExpenses, getExpenseCategories, getVariableExpenses } from '@/lib/queries/expenses'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has completed setup
  const settings = await getUserSettings(user.id)

  if (!settings) {
    redirect('/setup')
  }

  // Get current budget period
  const currentPeriod = await getCurrentBudgetPeriod(user.id)

  // Get next income payment
  const nextIncome = await getNextIncomePayment(user.id)

  // Get all active fixed expenses
  const fixedExpenses = await getActiveFixedExpenses(user.id)

  // Get categories for the expense modal
  const categories = await getExpenseCategories(user.id)

  // Get variable expenses for current period
  const today = new Date().toISOString().split('T')[0]
  const variableExpenses = await getVariableExpenses(
    user.id,
    currentPeriod?.start_date || today,
    currentPeriod?.end_date || today
  )

  // Calculate fixed expenses that have already been charged this period
  let fixedExpensesPaid = 0
  let fixedExpensesPending = 0
  const currentDay = new Date().getDate()

  if (fixedExpenses) {
    fixedExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount)
      if (expense.charge_day <= currentDay) {
        fixedExpensesPaid += amount
      } else {
        fixedExpensesPending += amount
      }
    })
  }

  // Calculate remaining from salary after fixed expenses
  const salaryAfterFixed = nextIncome ? parseFloat(nextIncome.amount) - fixedExpensesPaid : 0

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
        <div className="mb-6 flex gap-4">
          <DashboardClient categories={categories || []} />
          <a
            href="/fixed-expenses"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Gastos Fijos
          </a>
          <a
            href="/calendar"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            📅 Calendario
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Salary After Fixed Expenses Card */}
          {nextIncome && (
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
              <h2 className="text-sm font-medium opacity-90">
                Disponible del Salario
              </h2>
              <p className="mt-2 text-3xl font-bold">
                ${salaryAfterFixed.toFixed(2)}
              </p>
              <p className="mt-1 text-sm opacity-75">
                Después de gastos fijos pagados
              </p>
              <div className="mt-4 space-y-1 text-xs opacity-90">
                <div className="flex justify-between">
                  <span>Salario:</span>
                  <span>${parseFloat(nextIncome.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos fijos pagados:</span>
                  <span>-${fixedExpensesPaid.toFixed(2)}</span>
                </div>
                {fixedExpensesPending > 0 && (
                  <div className="flex justify-between border-t border-white/20 pt-1">
                    <span>Pendientes este mes:</span>
                    <span>${fixedExpensesPending.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Period Card */}
          {currentPeriod && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Presupuesto Variable
              </h2>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                ${currentPeriod.remaining.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Disponible de ${currentPeriod.total_budget.toFixed(2)}
              </p>
              <div className="mt-4 space-y-1 text-xs text-zinc-500 dark:text-zinc-500">
                <div className="flex justify-between">
                  <span>Presupuesto:</span>
                  <span>${currentPeriod.initial_budget.toFixed(2)}</span>
                </div>
                {currentPeriod.carried_over !== 0 && (
                  <div className="flex justify-between">
                    <span>Arrastrado:</span>
                    <span className={currentPeriod.carried_over > 0 ? 'text-green-600' : 'text-red-600'}>
                      {currentPeriod.carried_over > 0 ? '+' : ''}${currentPeriod.carried_over.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Gastado:</span>
                  <span>-${currentPeriod.spent.toFixed(2)}</span>
                </div>
              </div>
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
        </div>

        {/* Fixed Expenses and Variable Expenses Side by Side */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Fixed Expenses Timeline */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Gastos Fijos del Mes
            </h2>
            {fixedExpenses && fixedExpenses.length > 0 ? (
              <>
                <div className="space-y-2">
                  {fixedExpenses.map(expense => {
                    const isPaid = expense.charge_day <= currentDay
                    return (
                      <div
                        key={expense.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          isPaid
                            ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
                            : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            isPaid
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                          }`}>
                            {expense.charge_day}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              {expense.description}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {isPaid ? 'Pagado' : 'Pendiente'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          ${parseFloat(expense.amount).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Total gastos fijos
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    ${(fixedExpensesPaid + fixedExpensesPending).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No hay gastos fijos registrados
                </p>
              </div>
            )}
          </div>

          {/* Variable Expenses Table */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Gastos Variables
              </h2>
              {currentPeriod && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Período actual
                </span>
              )}
            </div>

            {variableExpenses && variableExpenses.length > 0 ? (
              <>
                <div className="space-y-2">
                  {variableExpenses.map(expense => (
                    <div
                      key={expense.id}
                      className="flex items-start justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {expense.description}
                          </p>
                          {expense.category && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: expense.category.color }}
                            >
                              {expense.category.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>
                            {new Date(expense.expense_date).toLocaleDateString('es-MX', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </span>
                          {expense.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate">{expense.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Total gastado
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    ${variableExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No hay gastos variables
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Usa "+ Agregar Gasto"
                </p>
              </div>
            )}
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
