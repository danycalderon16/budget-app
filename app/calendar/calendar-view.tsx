'use client'

import { useState } from 'react'

interface IncomeSource {
  id: string
  name: string
  amount: string
  next_payment_date: string | null
}

interface FixedExpense {
  id: string
  description: string
  amount: string
  charge_day: number
  category: { name: string; color: string } | null
}

interface VariableExpense {
  id: string
  description: string
  amount: string
  expense_date: string
  notes: string | null
  category: { name: string; color: string } | null
}

interface IncomeTransaction {
  id: string
  amount: string
  received_date: string
  income_source: { name: string } | null
}

interface CalendarViewProps {
  incomeSources: IncomeSource[]
  fixedExpenses: FixedExpense[]
  variableExpenses: VariableExpense[]
  incomeTransactions: IncomeTransaction[]
}

export default function CalendarView({
  incomeSources,
  fixedExpenses,
  variableExpenses,
  incomeTransactions
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(new Date().getDate())
  }

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const events: Array<{
      type: 'income' | 'fixed' | 'variable' | 'income_transaction'
      description: string
      amount: number
      category?: { name: string; color: string }
    }> = []

    // Check income payments
    incomeSources.forEach(income => {
      if (income.next_payment_date) {
        const paymentDate = new Date(income.next_payment_date)
        if (paymentDate.getMonth() === month && paymentDate.getDate() === day) {
          events.push({
            type: 'income',
            description: income.name,
            amount: parseFloat(income.amount)
          })
        }
      }
    })

    // Check fixed expenses
    fixedExpenses.forEach(expense => {
      if (expense.charge_day === day) {
        events.push({
          type: 'fixed',
          description: expense.description,
          amount: parseFloat(expense.amount),
          category: expense.category || undefined
        })
      }
    })

    // Check variable expenses
    variableExpenses.forEach(expense => {
      const expenseDate = new Date(expense.expense_date)
      if (expenseDate.getMonth() === month && expenseDate.getDate() === day) {
        events.push({
          type: 'variable',
          description: expense.description,
          amount: parseFloat(expense.amount),
          category: expense.category || undefined
        })
      }
    })

    // Check income transactions
    incomeTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.received_date)
      if (transactionDate.getMonth() === month && transactionDate.getDate() === day) {
        events.push({
          type: 'income_transaction',
          description: transaction.income_source?.name || 'Ingreso',
          amount: parseFloat(transaction.amount)
        })
      }
    })

    return events
  }

  // Calculate daily balance
  const getDailyBalance = (day: number) => {
    const events = getEventsForDay(day)
    return events.reduce((sum, event) => {
      if (event.type === 'income' || event.type === 'income_transaction') {
        return sum + event.amount
      }
      return sum - event.amount
    }, 0)
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
        <button
          onClick={goToPreviousMonth}
          className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
        {/* Day names */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const events = getEventsForDay(day)
            const balance = getDailyBalance(day)
            const isToday = isCurrentMonth && today.getDate() === day
            const isSelected = selectedDay === day

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`aspect-square rounded-lg border p-2 text-left transition-all hover:border-zinc-400 dark:hover:border-zinc-600 ${
                  isToday
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : isSelected
                    ? 'border-zinc-400 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex h-full flex-col">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-50'
                  }`}>
                    {day}
                  </span>
                  
                  {events.length > 0 && (
                    <div className="mt-1 flex-1 space-y-0.5">
                      {events.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className={`truncate rounded px-1 text-xs ${
                            event.type === 'income' || event.type === 'income_transaction'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : event.type === 'fixed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}
                        >
                          ${event.amount.toFixed(0)}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          +{events.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {dayNames[new Date(year, month, selectedDay).getDay()]} {selectedDay} de {monthNames[month]}
          </h3>

          {getEventsForDay(selectedDay).length > 0 ? (
            <div className="space-y-3">
              {getEventsForDay(selectedDay).map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      event.type === 'income' || event.type === 'income_transaction'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : event.type === 'fixed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {event.type === 'income' || event.type === 'income_transaction' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {event.description}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {event.type === 'income' || event.type === 'income_transaction'
                          ? 'Ingreso'
                          : event.type === 'fixed'
                          ? 'Gasto Fijo'
                          : 'Gasto Variable'}
                        {event.category && ` • ${event.category.name}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${
                    event.type === 'income' || event.type === 'income_transaction'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {event.type === 'income' || event.type === 'income_transaction' ? '+' : '-'}
                    ${event.amount.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Balance del día
                </span>
                <span className={`text-lg font-bold ${
                  getDailyBalance(selectedDay) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {getDailyBalance(selectedDay) >= 0 ? '+' : ''}
                  ${getDailyBalance(selectedDay).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              No hay eventos en este día
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Leyenda
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900/30" />
            <span className="text-zinc-600 dark:text-zinc-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-100 dark:bg-red-900/30" />
            <span className="text-zinc-600 dark:text-zinc-400">Gastos Fijos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-100 dark:bg-orange-900/30" />
            <span className="text-zinc-600 dark:text-zinc-400">Gastos Variables</span>
          </div>
        </div>
      </div>
    </div>
  )
}
