'use client'

import { useState } from 'react'
import AddExpenseModal from './add-expense-modal'

interface Category {
  id: string
  name: string
  color: string
}

interface DashboardClientProps {
  categories: Category[]
}

export default function DashboardClient({ categories }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
      >
        + Agregar Gasto
      </button>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
      />
    </>
  )
}
