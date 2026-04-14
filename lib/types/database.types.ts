export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FrequencyType = 
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly'
  | 'custom_days'
  | 'custom_weekday'

export type PeriodType = 'monthly' | 'weekly' | 'custom'

export interface Database {
  public: {
    Tables: {
      income_sources: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          frequency_type: FrequencyType
          frequency_config: Json
          start_date: string
          next_payment_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          frequency_type: FrequencyType
          frequency_config?: Json
          start_date?: string
          next_payment_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          frequency_type?: FrequencyType
          frequency_config?: Json
          start_date?: string
          next_payment_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      income_transactions: {
        Row: {
          id: string
          user_id: string
          income_source_id: string | null
          amount: number
          received_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          income_source_id?: string | null
          amount: number
          received_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          income_source_id?: string | null
          amount?: number
          received_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
      fixed_expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          description: string
          amount: number
          charge_day: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          description: string
          amount: number
          charge_day: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          description?: string
          amount?: number
          charge_day?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      variable_expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          description: string
          amount: number
          expense_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          description: string
          amount: number
          expense_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          description?: string
          amount?: number
          expense_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budget_periods: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          initial_budget: number
          carried_over: number
          total_budget: number
          spent: number
          remaining: number
          is_closed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          initial_budget?: number
          carried_over?: number
          spent?: number
          is_closed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          initial_budget?: number
          carried_over?: number
          spent?: number
          is_closed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          default_variable_budget: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_variable_budget?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          default_variable_budget?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
