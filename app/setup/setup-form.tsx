'use client'

import { useState } from 'react'
import { submitSetup } from './actions'

type FrequencyType = 'weekly' | 'biweekly' | 'monthly' | 'custom_days'

interface SetupFormProps {
  userId: string
}

export default function SetupForm({ userId }: SetupFormProps) {
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('biweekly')
  const [showCustomDays, setShowCustomDays] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFrequencyChange = (value: FrequencyType) => {
    setFrequencyType(value)
    setShowCustomDays(value === 'custom_days')
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await submitSetup(formData)
    } catch (error) {
      console.error('Error submitting setup:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Income Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          1. Información de Ingreso
        </h3>

        <div>
          <label htmlFor="income_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre del ingreso
          </label>
          <input
            type="text"
            id="income_name"
            name="income_name"
            required
            placeholder="Ej: Salario principal"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div>
          <label htmlFor="income_amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Monto del salario
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              $
            </span>
            <input
              type="number"
              id="income_amount"
              name="income_amount"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="block w-full rounded-md border border-zinc-300 py-2 pl-7 pr-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="frequency_type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Frecuencia de pago
          </label>
          <select
            id="frequency_type"
            name="frequency_type"
            value={frequencyType}
            onChange={(e) => handleFrequencyChange(e.target.value as FrequencyType)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="weekly">Semanal (cada 7 días)</option>
            <option value="biweekly">Quincenal (cada 14 días)</option>
            <option value="monthly">Mensual</option>
            <option value="custom_days">Personalizado (cada X días)</option>
          </select>
        </div>

        {showCustomDays && (
          <div>
            <label htmlFor="custom_days" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Cada cuántos días
            </label>
            <input
              type="number"
              id="custom_days"
              name="custom_days"
              min="1"
              max="365"
              placeholder="Ej: 10"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        )}

        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Fecha del próximo pago
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      {/* Budget Section */}
      <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          2. Presupuesto Variable
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Este es el dinero que tendrás disponible para gastos del día a día (comida, transporte, entretenimiento, etc.)
        </p>

        <div>
          <label htmlFor="variable_budget" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Presupuesto por período
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              $
            </span>
            <input
              type="number"
              id="variable_budget"
              name="variable_budget"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="block w-full rounded-md border border-zinc-300 py-2 pl-7 pr-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Este monto se renovará cada vez que recibas tu pago. Si sobra o falta, se arrastrará al siguiente período.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Guardando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}
