import { createClient } from '@/lib/supabase/server'

export async function getIncomeSources(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw error
  return data
}

export async function getNextIncomePayment(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('next_payment_date', { ascending: true })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export async function getIncomeTransactions(userId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('income_transactions')
    .select(`
      *,
      income_source:income_sources(name)
    `)
    .eq('user_id', userId)
    .gte('received_date', startDate)
    .lte('received_date', endDate)

  if (error) throw error
  return data
}
