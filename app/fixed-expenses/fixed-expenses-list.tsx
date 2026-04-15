'use client'

import { toggleFixedExpense, deleteFixedExpense } from './actions'
import { useState } from 'react'

interface FixedExpense {
  id: string
  description: string
  amount: string
  charge_day: number
  is_active: boolean
  notes: string | null
  category: {
    id: string
    name: string
    color: string
  } | null
}

interface FixedExpensesListProps {
  expenses: FixedExpense[]
}

export default function FixedExpensesList({ expenses }: FixedExpensesListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoadingId(id)
    try {
      await toggleFixedExpense(id, currentState)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto fijo?')) return
    
    setLoadingId(id)
    try {
      await deleteFixedExpense(id)
    } finally {
      setLoadingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No tienes gastos fijos registrados
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Agrega tu primer gasto fijo usando el formulario
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map(expense => (
        <div
          key={expense.id}
          className={`rounded-lg border p-4 transition-opacity ${
            expense.is_active
              ? 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
              : 'border-zinc-100 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {expense.description}
                </h3>
                {expense.category && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: expense.category.color }}
                  >
                    {expense.category.name}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</span>
                <span>•</span>
                <span>Día {expense.charge_day}</span>
              </div>
              {expense.notes && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {expense.notes}
                </p>
              )}
            </div>

            <div className="ml-4 flex gap-2">
              <button
                onClick={() => handleToggle(expense.id, expense.is_active)}
                disabled={loadingId === expense.id}
                className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
                title={expense.is_active ? 'Desactivar' : 'Activar'}
              >
                {expense.is_active ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleDelete(expense.id)}
                disabled={loadingId === expense.id}
                className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Eliminar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
