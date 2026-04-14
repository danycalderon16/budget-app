import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SetupForm from './setup-form'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user already has settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check if user has income sources
  const { data: incomeSources } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', user.id)

  // If already configured, redirect to dashboard
  if (settings && incomeSources && incomeSources.length > 0) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Configuración Inicial
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              ¡Bienvenido! Configuremos tu presupuesto
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Necesitamos algunos datos para empezar a gestionar tus finanzas.
            </p>
          </div>

          <SetupForm userId={user.id} />
        </div>
      </main>
    </div>
  )
}
