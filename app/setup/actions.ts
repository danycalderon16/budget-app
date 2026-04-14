'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitSetup(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Extract form data
  const incomeName = formData.get('income_name') as string
  const incomeAmount = parseFloat(formData.get('income_amount') as string)
  const frequencyType = formData.get('frequency_type') as string
  const startDate = formData.get('start_date') as string
  const variableBudget = parseFloat(formData.get('variable_budget') as string)
  
  // Build frequency config
  let frequencyConfig = {}
  if (frequencyType === 'custom_days') {
    const customDays = formData.get('custom_days') as string
    frequencyConfig = { days: parseInt(customDays) }
  }

  try {
    // 1. Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        default_variable_budget: variableBudget,
        currency: 'USD'
      })

    if (settingsError) throw settingsError

    // 2. Create income source
    const { error: incomeError } = await supabase
      .from('income_sources')
      .insert({
        user_id: user.id,
        name: incomeName,
        amount: incomeAmount,
        frequency_type: frequencyType,
        frequency_config: frequencyConfig,
        start_date: startDate,
        is_active: true
      })

    if (incomeError) throw incomeError

    // 3. Calculate period end date based on frequency
    let periodEndDate = new Date(startDate)
    
    switch (frequencyType) {
      case 'weekly':
        periodEndDate.setDate(periodEndDate.getDate() + 7)
        break
      case 'biweekly':
        periodEndDate.setDate(periodEndDate.getDate() + 14)
        break
      case 'monthly':
        periodEndDate.setMonth(periodEndDate.getMonth() + 1)
        break
      case 'custom_days':
        const days = (frequencyConfig as any).days || 14
        periodEndDate.setDate(periodEndDate.getDate() + days)
        break
    }
    
    // Subtract 1 day to get the last day of the period
    periodEndDate.setDate(periodEndDate.getDate() - 1)

    // 4. Create initial budget period
    const { error: periodError } = await supabase
      .from('budget_periods')
      .insert({
        user_id: user.id,
        start_date: startDate,
        end_date: periodEndDate.toISOString().split('T')[0],
        initial_budget: variableBudget,
        carried_over: 0,
        spent: 0,
        is_closed: false
      })

    if (periodError) throw periodError

    revalidatePath('/', 'layout')
    redirect('/dashboard')
    
  } catch (error) {
    console.error('Setup error:', error)
    throw error
  }
}
