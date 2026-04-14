# Budget App with Supabase

A Next.js application integrated with Supabase for authentication and database management.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Features

- ✅ Supabase authentication (email/password)
- ✅ Server-side and client-side Supabase clients
- ✅ Protected routes with middleware
- ✅ Login/Signup pages
- ✅ Dashboard with user info
- ✅ Logout functionality

## Project Structure

```
├── app/
│   ├── auth/login/          # Login page and actions
│   ├── dashboard/           # Protected dashboard
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser client
│       └── server.ts        # Server client
├── middleware.ts            # Auth middleware
└── .env.local              # Environment variables
```

## Database Setup

To add database functionality, create tables in your Supabase project:

```sql
-- Example: Create a budgets table
create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table budgets enable row level security;

-- Create policy for users to only see their own budgets
create policy "Users can view their own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);
```

## Next Steps

- Add database tables in Supabase
- Create CRUD operations for your data
- Add more authentication methods (OAuth, magic links)
- Implement real-time subscriptions
- Add user profile management
