import { createClient } from '@/lib/supabase/server'

export async function getFixedExpenses(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select(`
      *,
      category:expense_categories(id, name, color)
    `)
    .eq('user_id', userId)
    .order('charge_day', { ascending: true })

  if (error) throw error
  return data
}

export async function getActiveFixedExpenses(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('charge_day', { ascending: true })

  if (error) throw error
  return data
}

export async function getVariableExpenses(userId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('variable_expenses')
    .select(`
      *,
      category:expense_categories(id, name, color)
    `)
    .eq('user_id', userId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getExpenseCategories(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) throw error
  return data
}
