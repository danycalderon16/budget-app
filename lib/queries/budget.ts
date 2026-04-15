import { createClient } from '@/lib/supabase/server'

export async function getCurrentBudgetPeriod(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('user_id', userId)
    .lte('start_date', today)
    .gte('end_date', today)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export async function getUserSettings(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
