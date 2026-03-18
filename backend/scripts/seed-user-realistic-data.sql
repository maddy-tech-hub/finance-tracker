-- User-scoped realistic seed
-- Purpose: populate realistic finance data for ONE user to verify dashboard/reports/flows.
-- Usage:
-- 1) Register user in app.
-- 2) Set target_email.
-- 3) Run this in Supabase SQL Editor.
-- Note: this script first cleans existing data for that user, then inserts fresh data.

DO $$
DECLARE
  target_email text := 'replace-with-your-email@example.com';
  v_user_id uuid;
  v_now timestamptz := timezone('utc', now());
  v_month int := EXTRACT(MONTH FROM timezone('utc', now()));
  v_year int := EXTRACT(YEAR FROM timezone('utc', now()));

  v_acc_main_bank uuid := gen_random_uuid();
  v_acc_cash_wallet uuid := gen_random_uuid();
  v_acc_credit_card uuid := gen_random_uuid();
  v_acc_investment uuid := gen_random_uuid();

  v_cat_salary uuid := gen_random_uuid();
  v_cat_freelance uuid := gen_random_uuid();
  v_cat_bonus uuid := gen_random_uuid();
  v_cat_food uuid := gen_random_uuid();
  v_cat_rent uuid := gen_random_uuid();
  v_cat_transport uuid := gen_random_uuid();
  v_cat_subscriptions uuid := gen_random_uuid();
  v_cat_shopping uuid := gen_random_uuid();
  v_cat_utilities uuid := gen_random_uuid();
  v_cat_travel uuid := gen_random_uuid();

  v_goal_emergency uuid := gen_random_uuid();
  v_goal_vacation uuid := gen_random_uuid();
  v_goal_car uuid := gen_random_uuid();

  v_rec_salary uuid := gen_random_uuid();
  v_rec_subscription uuid := gen_random_uuid();
  v_rec_sip_transfer uuid := gen_random_uuid();
BEGIN
  SELECT u."Id" INTO v_user_id
  FROM public.users u
  WHERE lower(u."Email") = lower(target_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %. Register first, then rerun.', target_email;
  END IF;

  -- User-scoped cleanup
  DELETE FROM public.transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.recurring_transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.budgets WHERE "UserId" = v_user_id;
  DELETE FROM public.goals WHERE "UserId" = v_user_id;
  DELETE FROM public.password_reset_tokens WHERE "UserId" = v_user_id;
  DELETE FROM public.refresh_tokens WHERE "UserId" = v_user_id;
  DELETE FROM public.categories WHERE "UserId" = v_user_id;
  DELETE FROM public.accounts WHERE "UserId" = v_user_id;

  -- Accounts
  INSERT INTO public.accounts
    ("Id","UserId","Name","Type","Currency","Balance","IsArchived","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_acc_main_bank, v_user_id, 'Main Bank Account', 2, 'INR', 238500.00, false, v_now, v_now),
    (v_acc_cash_wallet, v_user_id, 'Cash Wallet', 1, 'INR', 6200.00, false, v_now, v_now),
    (v_acc_credit_card, v_user_id, 'Credit Card', 3, 'INR', 18000.00, false, v_now, v_now),
    (v_acc_investment, v_user_id, 'Investment Account', 4, 'INR', 132000.00, false, v_now, v_now);

  -- Categories
  INSERT INTO public.categories
    ("Id","UserId","Name","ColorHex","Icon","Type","IsDefault","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_cat_salary, v_user_id, 'Salary', '#22C55E', 'wallet', 1, true, v_now, v_now),
    (v_cat_freelance, v_user_id, 'Freelance', '#16A34A', 'briefcase', 1, false, v_now, v_now),
    (v_cat_bonus, v_user_id, 'Bonus', '#15803D', 'gift', 1, false, v_now, v_now),
    (v_cat_food, v_user_id, 'Food', '#F59E0B', 'utensils', 2, true, v_now, v_now),
    (v_cat_rent, v_user_id, 'Rent', '#EF4444', 'home', 2, true, v_now, v_now),
    (v_cat_transport, v_user_id, 'Transport', '#3B82F6', 'car', 2, true, v_now, v_now),
    (v_cat_subscriptions, v_user_id, 'Subscriptions', '#8B5CF6', 'repeat', 2, true, v_now, v_now),
    (v_cat_shopping, v_user_id, 'Shopping', '#EC4899', 'shopping-bag', 2, false, v_now, v_now),
    (v_cat_utilities, v_user_id, 'Utilities', '#14B8A6', 'bolt', 2, true, v_now, v_now),
    (v_cat_travel, v_user_id, 'Travel', '#0EA5E9', 'plane', 2, false, v_now, v_now);

  -- Goals
  INSERT INTO public.goals
    ("Id","UserId","LinkedAccountId","Name","TargetAmount","CurrentAmount","TargetDate","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_goal_emergency, v_user_id, v_acc_main_bank, 'Emergency Fund', 300000.00, 145000.00, (v_now + interval '9 months'), v_now, v_now),
    (v_goal_vacation, v_user_id, v_acc_main_bank, 'Japan Vacation', 180000.00, 72000.00, (v_now + interval '6 months'), v_now, v_now),
    (v_goal_car, v_user_id, v_acc_investment, 'Car Down Payment', 500000.00, 214000.00, (v_now + interval '14 months'), v_now, v_now);

  -- Budgets for current month
  INSERT INTO public.budgets
    ("Id","UserId","CategoryId","Month","Year","Amount","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (gen_random_uuid(), v_user_id, v_cat_food, v_month, v_year, 18000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_rent, v_month, v_year, 30000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_transport, v_month, v_year, 7000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_subscriptions, v_month, v_year, 2500.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_utilities, v_month, v_year, 6000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_shopping, v_month, v_year, 10000.00, v_now, v_now);

  -- Recurring
  INSERT INTO public.recurring_transactions
    ("Id","UserId","AccountId","DestinationAccountId","CategoryId","Type","Frequency","Amount","Note","StartDate","NextRunDate","EndDate","IsPaused","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_rec_salary, v_user_id, v_acc_main_bank, NULL, v_cat_salary, 1, 3, 120000.00, 'Monthly Salary', date_trunc('month', v_now), date_trunc('month', v_now) + interval '1 month', NULL, false, v_now, v_now),
    (v_rec_subscription, v_user_id, v_acc_main_bank, NULL, v_cat_subscriptions, 2, 3, 499.00, 'Prime Video', date_trunc('month', v_now), date_trunc('month', v_now) + interval '10 days', NULL, false, v_now, v_now),
    (v_rec_sip_transfer, v_user_id, v_acc_main_bank, v_acc_investment, NULL, 3, 3, 10000.00, 'Monthly SIP Transfer', date_trunc('month', v_now), date_trunc('month', v_now) + interval '5 days', NULL, false, v_now, v_now);

  -- Transactions (income + expense + transfer across last ~2 months)
  INSERT INTO public.transactions
    ("Id","UserId","AccountId","DestinationAccountId","CategoryId","RecurringTransactionId","Type","Amount","Note","TransactionDate","IsRecurringGenerated","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_salary, v_rec_salary, 1, 120000.00, 'Salary - This Month', date_trunc('month', v_now) + interval '1 day', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_salary, v_rec_salary, 1, 120000.00, 'Salary - Last Month', date_trunc('month', v_now) - interval '1 month' + interval '1 day', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_freelance, NULL, 1, 22000.00, 'Freelance Project', v_now - interval '41 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_bonus, NULL, 1, 15000.00, 'Performance Bonus', v_now - interval '19 days', false, v_now, v_now),

    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_rent, NULL, 2, 30000.00, 'House Rent', date_trunc('month', v_now) + interval '2 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_utilities, NULL, 2, 4200.00, 'Electricity Bill', v_now - interval '12 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_utilities, NULL, 2, 1800.00, 'Internet Bill', v_now - interval '9 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_subscriptions, v_rec_subscription, 2, 499.00, 'Prime Video', v_now - interval '6 days', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_transport, NULL, 2, 2800.00, 'Fuel', v_now - interval '7 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_credit_card, NULL, v_cat_shopping, NULL, 2, 5400.00, 'Online Shopping', v_now - interval '8 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_cash_wallet, NULL, v_cat_food, NULL, 2, 650.00, 'Lunch', v_now - interval '2 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_cash_wallet, NULL, v_cat_food, NULL, 2, 420.00, 'Snacks', v_now - interval '1 day', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_travel, NULL, 2, 11000.00, 'Weekend Trip', v_now - interval '20 days', false, v_now, v_now),

    (gen_random_uuid(), v_user_id, v_acc_main_bank, v_acc_cash_wallet, NULL, NULL, 3, 5000.00, 'ATM Withdrawal', v_now - interval '15 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, v_acc_investment, NULL, v_rec_sip_transfer, 3, 10000.00, 'Monthly SIP Transfer', v_now - interval '5 days', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_cash_wallet, v_acc_main_bank, NULL, NULL, 3, 1200.00, 'Cash Deposit', v_now - interval '3 days', false, v_now, v_now);

  -- Dense expense history for reports/charts
  INSERT INTO public.transactions
    ("Id","UserId","AccountId","DestinationAccountId","CategoryId","RecurringTransactionId","Type","Amount","Note","TransactionDate","IsRecurringGenerated","CreatedAtUtc","UpdatedAtUtc")
  SELECT
    gen_random_uuid(),
    v_user_id,
    v_acc_cash_wallet,
    NULL,
    v_cat_food,
    NULL,
    2,
    (140 + (g * 18))::numeric(18,2),
    'Daily Food Expense #' || g,
    (date_trunc('day', v_now) - (g || ' days')::interval),
    false,
    v_now,
    v_now
  FROM generate_series(4, 24) AS g;

  RAISE NOTICE 'Realistic data seeded for user: %', target_email;
END $$;
