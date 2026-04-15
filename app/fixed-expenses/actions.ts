'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addFixedExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const chargeDay = parseInt(formData.get('charge_day') as string)
  const categoryId = formData.get('category_id') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('fixed_expenses')
    .insert({
      user_id: user.id,
      description,
      amount,
      charge_day: chargeDay,
      category_id: categoryId || null,
      notes: notes || null,
      is_active: true
    })

  if (error) {
    console.error('Error adding fixed expense:', error)
    throw error
  }

  revalidatePath('/fixed-expenses')
}

export async function toggleFixedExpense(id: string, currentState: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('fixed_expenses')
    .update({ is_active: !currentState })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling fixed expense:', error)
    throw error
  }

  revalidatePath('/fixed-expenses')
}

export async function deleteFixedExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('fixed_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting fixed expense:', error)
    throw error
  }

  revalidatePath('/fixed-expenses')
}
