'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function addVariableExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const categoryId = formData.get('category_id') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('variable_expenses')
    .insert({
      user_id: user.id,
      description,
      amount,
      expense_date: expenseDate,
      category_id: categoryId || null,
      notes: notes || null
    })

  if (error) {
    console.error('Error adding variable expense:', error)
    throw error
  }

  revalidatePath('/dashboard')
}
