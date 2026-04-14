import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Budget App
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Manage your finances with ease. Sign in to get started with your personal budget tracker.
        </p>
        <Link
          href="/auth/login"
          className="rounded-md bg-zinc-900 px-6 py-3 text-base font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
