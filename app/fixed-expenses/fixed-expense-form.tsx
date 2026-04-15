'use client'

import { useState } from 'react'
import { addFixedExpense } from './actions'

interface Category {
  id: string
  name: string
  color: string
}

interface FixedExpenseFormProps {
  categories: Category[]
}

export default function FixedExpenseForm({ categories }: FixedExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await addFixedExpense(formData)
      // Reset form
      const form = document.getElementById('fixed-expense-form') as HTMLFormElement
      form?.reset()
    } catch (error) {
      console.error('Error adding fixed expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="fixed-expense-form" action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Descripción *
        </label>
        <input
          type="text"
          id="description"
          name="description"
          required
          placeholder="Ej: Renta, Netflix, Internet"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Monto *
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            $
          </span>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="block w-full rounded-md border border-zinc-300 py-2 pl-7 pr-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="charge_day" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Día de cobro *
        </label>
        <select
          id="charge_day"
          name="charge_day"
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">Selecciona un día</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>
              Día {day}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Si el mes no tiene este día, se cobrará el último día del mes
        </p>
      </div>

      {categories.length > 0 && (
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Categoría (opcional)
          </label>
          <select
            id="category_id"
            name="category_id"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">Sin categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Información adicional..."
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? 'Agregando...' : 'Agregar Gasto Fijo'}
      </button>
    </form>
  )
}
