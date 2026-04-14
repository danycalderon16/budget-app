-- Budget App Database Schema

-- ============================================
-- INCOME SOURCES TABLE
-- ============================================
-- Stores user's income sources (salary, freelance, etc.)
create table income_sources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, -- e.g., "Main Job", "Freelance", "Side Hustle"
  amount decimal(10, 2) not null check (amount >= 0),
  
  -- Frequency configuration
  frequency_type text not null check (frequency_type in (
    'weekly',           -- Every week
    'biweekly',         -- Every 2 weeks (14 days)
    'semimonthly',      -- Twice a month (15th and last day)
    'monthly',          -- Once a month
    'custom_days',      -- Every X days
    'custom_weekday'    -- Every X weeks on specific weekday
  )),
  
  -- Custom frequency settings (JSON for flexibility)
  frequency_config jsonb default '{}'::jsonb,
  -- Examples:
  -- For 'custom_days': {"days": 14}
  -- For 'custom_weekday': {"weeks": 2, "weekday": 4} (every 2 weeks on Thursday)
  -- For 'semimonthly': {"days": [15, -1]} (-1 means last day of month)
  -- For 'monthly': {"day": 1} (day of month)
  
  -- Start date for calculating next payment
  start_date date not null default current_date,
  next_payment_date date, -- Calculated field
  
  is_active boolean default true,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INCOME TRANSACTIONS TABLE
-- ============================================
-- Records actual income received
create table income_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  income_source_id uuid references income_sources(id) on delete set null,
  
  amount decimal(10, 2) not null check (amount >= 0),
  received_date date not null default current_date,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- EXPENSE CATEGORIES TABLE
-- ============================================
create table expense_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#6366f1', -- Hex color for UI
  icon text, -- Icon name or emoji
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, name)
);

-- ============================================
-- FIXED EXPENSES TABLE
-- ============================================
-- Recurring fixed expenses (rent, subscriptions, etc.)
create table fixed_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references expense_categories(id) on delete set null,
  
  description text not null, -- e.g., "Rent", "Netflix", "Internet"
  amount decimal(10, 2) not null check (amount >= 0),
  
  -- Day of month when this expense is charged (1-31)
  -- If day > days in month, it will be charged on last day of month
  charge_day int not null check (charge_day >= 1 and charge_day <= 31),
  
  is_active boolean default true,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- VARIABLE EXPENSES TABLE
-- ============================================
-- Day-to-day expenses that come from the variable budget
create table variable_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references expense_categories(id) on delete set null,
  
  description text not null,
  amount decimal(10, 2) not null check (amount >= 0),
  expense_date date not null default current_date,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- BUDGET PERIODS TABLE
-- ============================================
-- Tracks budget periods based on income frequency
-- Each period has a variable budget that carries over (positive or negative)
create table budget_periods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Period dates (aligned with income payment dates)
  start_date date not null,
  end_date date not null,
  
  -- Variable budget for this period
  initial_budget decimal(10, 2) not null default 0, -- Budget set by user
  carried_over decimal(10, 2) not null default 0,   -- Amount from previous period (+ or -)
  total_budget decimal(10, 2) generated always as (initial_budget + carried_over) stored,
  
  -- Calculated fields (updated by triggers or app)
  spent decimal(10, 2) default 0,
  remaining decimal(10, 2) generated always as (initial_budget + carried_over - spent) stored,
  
  is_closed boolean default false, -- True when period ends
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, start_date)
);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
-- Global settings for the user's budget system
create table user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  
  -- Default variable budget per period
  default_variable_budget decimal(10, 2) not null default 0,
  
  -- Currency preference
  currency text default 'USD',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table income_sources enable row level security;
alter table income_transactions enable row level security;
alter table expense_categories enable row level security;
alter table fixed_expenses enable row level security;
alter table variable_expenses enable row level security;
alter table budget_periods enable row level security;
alter table user_settings enable row level security;

-- Income Sources Policies
create policy "Users can view their own income sources"
  on income_sources for select
  using (auth.uid() = user_id);

create policy "Users can insert their own income sources"
  on income_sources for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own income sources"
  on income_sources for update
  using (auth.uid() = user_id);

create policy "Users can delete their own income sources"
  on income_sources for delete
  using (auth.uid() = user_id);

-- Income Transactions Policies
create policy "Users can view their own income transactions"
  on income_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own income transactions"
  on income_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own income transactions"
  on income_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own income transactions"
  on income_transactions for delete
  using (auth.uid() = user_id);

-- Expense Categories Policies
create policy "Users can view their own expense categories"
  on expense_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expense categories"
  on expense_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expense categories"
  on expense_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expense categories"
  on expense_categories for delete
  using (auth.uid() = user_id);

-- Fixed Expenses Policies
create policy "Users can view their own fixed expenses"
  on fixed_expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own fixed expenses"
  on fixed_expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own fixed expenses"
  on fixed_expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own fixed expenses"
  on fixed_expenses for delete
  using (auth.uid() = user_id);

-- Variable Expenses Policies
create policy "Users can view their own variable expenses"
  on variable_expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own variable expenses"
  on variable_expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own variable expenses"
  on variable_expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own variable expenses"
  on variable_expenses for delete
  using (auth.uid() = user_id);

-- Budget Periods Policies
create policy "Users can view their own budget periods"
  on budget_periods for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budget periods"
  on budget_periods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budget periods"
  on budget_periods for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budget periods"
  on budget_periods for delete
  using (auth.uid() = user_id);

-- User Settings Policies
create policy "Users can view their own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on user_settings for update
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index income_sources_user_id_idx on income_sources(user_id);
create index income_sources_next_payment_date_idx on income_sources(next_payment_date) where is_active = true;

create index income_transactions_user_id_idx on income_transactions(user_id);
create index income_transactions_received_date_idx on income_transactions(received_date);
create index income_transactions_source_id_idx on income_transactions(income_source_id);

create index expense_categories_user_id_idx on expense_categories(user_id);

create index fixed_expenses_user_id_idx on fixed_expenses(user_id);
create index fixed_expenses_charge_day_idx on fixed_expenses(charge_day) where is_active = true;

create index variable_expenses_user_id_idx on variable_expenses(user_id);
create index variable_expenses_expense_date_idx on variable_expenses(expense_date);
create index variable_expenses_category_id_idx on variable_expenses(category_id);

create index budget_periods_user_id_idx on budget_periods(user_id);
create index budget_periods_dates_idx on budget_periods(start_date, end_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate next payment date
create or replace function calculate_next_payment_date(
  p_frequency_type text,
  p_frequency_config jsonb,
  p_start_date date,
  p_current_date date default current_date
)
returns date
language plpgsql
as $$
declare
  v_next_date date;
  v_days_interval int;
  v_weeks_interval int;
  v_weekday int;
begin
  case p_frequency_type
    when 'weekly' then
      v_next_date := p_start_date;
      while v_next_date <= p_current_date loop
        v_next_date := v_next_date + interval '7 days';
      end loop;
      
    when 'biweekly' then
      v_next_date := p_start_date;
      while v_next_date <= p_current_date loop
        v_next_date := v_next_date + interval '14 days';
      end loop;
      
    when 'monthly' then
      v_next_date := p_start_date;
      while v_next_date <= p_current_date loop
        v_next_date := v_next_date + interval '1 month';
      end loop;
      
    when 'custom_days' then
      v_days_interval := (p_frequency_config->>'days')::int;
      v_next_date := p_start_date;
      while v_next_date <= p_current_date loop
        v_next_date := v_next_date + (v_days_interval || ' days')::interval;
      end loop;
      
    else
      v_next_date := p_start_date;
  end case;
  
  return v_next_date;
end;
$$;

-- Trigger to update next_payment_date
create or replace function update_next_payment_date()
returns trigger
language plpgsql
as $$
begin
  new.next_payment_date := calculate_next_payment_date(
    new.frequency_type,
    new.frequency_config,
    new.start_date
  );
  return new;
end;
$$;

create trigger set_next_payment_date
  before insert or update on income_sources
  for each row
  execute function update_next_payment_date();

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger update_income_sources_updated_at before update on income_sources
  for each row execute function update_updated_at_column();

create trigger update_income_transactions_updated_at before update on income_transactions
  for each row execute function update_updated_at_column();

create trigger update_fixed_expenses_updated_at before update on fixed_expenses
  for each row execute function update_updated_at_column();

create trigger update_variable_expenses_updated_at before update on variable_expenses
  for each row execute function update_updated_at_column();

create trigger update_budget_periods_updated_at before update on budget_periods
  for each row execute function update_updated_at_column();

create trigger update_user_settings_updated_at before update on user_settings
  for each row execute function update_updated_at_column();

-- ============================================
-- FUNCTION: Update budget period spent amount
-- ============================================
create or replace function update_budget_period_spent()
returns trigger
language plpgsql
as $$
declare
  v_period_id uuid;
  v_total_spent decimal(10, 2);
begin
  -- Find the budget period for this expense date
  select id into v_period_id
  from budget_periods
  where user_id = new.user_id
    and new.expense_date >= start_date
    and new.expense_date <= end_date
  limit 1;

  if v_period_id is not null then
    -- Calculate total spent in this period
    select coalesce(sum(amount), 0) into v_total_spent
    from variable_expenses
    where user_id = new.user_id
      and expense_date >= (select start_date from budget_periods where id = v_period_id)
      and expense_date <= (select end_date from budget_periods where id = v_period_id);

    -- Update the period
    update budget_periods
    set spent = v_total_spent
    where id = v_period_id;
  end if;

  return new;
end;
$$;

create trigger update_period_spent_on_insert
  after insert on variable_expenses
  for each row
  execute function update_budget_period_spent();

create trigger update_period_spent_on_update
  after update on variable_expenses
  for each row
  execute function update_budget_period_spent();

create trigger update_period_spent_on_delete
  after delete on variable_expenses
  for each row
  execute function update_budget_period_spent();

-- ============================================
-- FUNCTION: Close period and carry over balance
-- ============================================
create or replace function close_budget_period(p_period_id uuid)
returns void
language plpgsql
as $$
declare
  v_user_id uuid;
  v_end_date date;
  v_remaining decimal(10, 2);
  v_next_start_date date;
  v_next_end_date date;
  v_default_budget decimal(10, 2);
begin
  -- Get period info
  select user_id, end_date, remaining
  into v_user_id, v_end_date, v_remaining
  from budget_periods
  where id = p_period_id;

  -- Mark period as closed
  update budget_periods
  set is_closed = true
  where id = p_period_id;

  -- Calculate next period dates (you'll need to adjust based on income frequency)
  v_next_start_date := v_end_date + interval '1 day';
  v_next_end_date := v_next_start_date + interval '14 days'; -- Example: biweekly

  -- Get default budget
  select default_variable_budget into v_default_budget
  from user_settings
  where user_id = v_user_id;

  -- Create next period with carried over balance
  insert into budget_periods (
    user_id,
    start_date,
    end_date,
    initial_budget,
    carried_over
  ) values (
    v_user_id,
    v_next_start_date,
    v_next_end_date,
    v_default_budget,
    v_remaining -- This can be positive or negative
  );
end;
$$;
