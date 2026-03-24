-- User-scoped realistic seed (V1 + V2)
-- Purpose: seed ONE registered user with realistic happy-path data
--          for dashboard, transactions, budgets, goals, recurring, reports,
--          insights/forecast and rules engine.
--
-- Usage:
-- 1) Register/login once in the app.
-- 2) Replace target_email below with that account email.
-- 3) Run this script in PostgreSQL.
--
-- Notes:
-- - Script is user-scoped and first clears that user's finance data.
-- - It does NOT delete the user row.
-- - It seeds rules + sample generated alerts/tags so V2 screens are testable.

DO $$
DECLARE
  target_email text := 'replace-with-your-email@example.com';
  v_user_id uuid;
  v_now timestamptz := timezone('utc', now());

  v_month int := EXTRACT(MONTH FROM timezone('utc', now()));
  v_year int := EXTRACT(YEAR FROM timezone('utc', now()));
  v_next_month int := EXTRACT(MONTH FROM (timezone('utc', now()) + interval '1 month'));
  v_next_year int := EXTRACT(YEAR FROM (timezone('utc', now()) + interval '1 month'));

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
  v_cat_misc uuid := gen_random_uuid();

  v_goal_emergency uuid := gen_random_uuid();
  v_goal_vacation uuid := gen_random_uuid();
  v_goal_car uuid := gen_random_uuid();

  v_rec_salary uuid := gen_random_uuid();
  v_rec_subscription uuid := gen_random_uuid();
  v_rec_sip_transfer uuid := gen_random_uuid();
  v_rec_insurance uuid := gen_random_uuid();

  v_rule_uber_to_transport uuid := gen_random_uuid();
  v_rule_high_amount_alert uuid := gen_random_uuid();
  v_rule_food_tag uuid := gen_random_uuid();
  v_rule_inactive_demo uuid := gen_random_uuid();

  v_tx_salary_this_month uuid := gen_random_uuid();
  v_tx_salary_last_month uuid := gen_random_uuid();
  v_tx_uber_large uuid := gen_random_uuid();
  v_tx_food_tagged uuid := gen_random_uuid();
  v_tx_transfer_sip uuid := gen_random_uuid();
BEGIN
  SELECT u."Id" INTO v_user_id
  FROM public.users u
  WHERE lower(u."Email") = lower(target_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %. Register first, then rerun.', target_email;
  END IF;

  -- Cleanup (child tables first)
  DELETE FROM public.transaction_tags WHERE "UserId" = v_user_id;
  DELETE FROM public.transaction_alerts WHERE "UserId" = v_user_id;
  DELETE FROM public.transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.recurring_transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.budgets WHERE "UserId" = v_user_id;
  DELETE FROM public.goals WHERE "UserId" = v_user_id;
  DELETE FROM public.rules WHERE "UserId" = v_user_id;
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
    (v_cat_travel, v_user_id, 'Travel', '#0EA5E9', 'plane', 2, false, v_now, v_now),
    (v_cat_misc, v_user_id, 'Miscellaneous', '#64748B', 'tag', 2, true, v_now, v_now);

  -- Goals
  INSERT INTO public.goals
    ("Id","UserId","LinkedAccountId","Name","TargetAmount","CurrentAmount","TargetDate","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_goal_emergency, v_user_id, v_acc_main_bank, 'Emergency Fund', 300000.00, 145000.00, (v_now + interval '9 months'), v_now, v_now),
    (v_goal_vacation, v_user_id, v_acc_main_bank, 'Japan Vacation', 180000.00, 72000.00, (v_now + interval '6 months'), v_now, v_now),
    (v_goal_car, v_user_id, v_acc_investment, 'Car Down Payment', 500000.00, 214000.00, (v_now + interval '14 months'), v_now, v_now);

  -- Budgets (current + next month so both V1 and preview states are populated)
  INSERT INTO public.budgets
    ("Id","UserId","CategoryId","Month","Year","Amount","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (gen_random_uuid(), v_user_id, v_cat_food, v_month, v_year, 18000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_rent, v_month, v_year, 30000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_transport, v_month, v_year, 7000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_subscriptions, v_month, v_year, 2500.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_utilities, v_month, v_year, 6000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_shopping, v_month, v_year, 10000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_food, v_next_month, v_next_year, 19000.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_transport, v_next_month, v_next_year, 7500.00, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_cat_subscriptions, v_next_month, v_next_year, 2600.00, v_now, v_now);

  -- Recurring schedule
  INSERT INTO public.recurring_transactions
    ("Id","UserId","AccountId","DestinationAccountId","CategoryId","Type","Frequency","Amount","Note","StartDate","NextRunDate","EndDate","IsPaused","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_rec_salary, v_user_id, v_acc_main_bank, NULL, v_cat_salary, 1, 3, 120000.00, 'Monthly Salary', date_trunc('month', v_now), date_trunc('month', v_now) + interval '1 month' + interval '1 day', NULL, false, v_now, v_now),
    (v_rec_subscription, v_user_id, v_acc_main_bank, NULL, v_cat_subscriptions, 2, 3, 499.00, 'Prime Video', date_trunc('month', v_now), date_trunc('day', v_now) + interval '2 days', NULL, false, v_now, v_now),
    (v_rec_sip_transfer, v_user_id, v_acc_main_bank, v_acc_investment, NULL, 3, 3, 10000.00, 'Monthly SIP Transfer', date_trunc('month', v_now), date_trunc('day', v_now) + interval '5 days', NULL, false, v_now, v_now),
    (v_rec_insurance, v_user_id, v_acc_main_bank, NULL, v_cat_misc, 2, 4, 18000.00, 'Annual health insurance', date_trunc('month', v_now), date_trunc('month', v_now) + interval '3 months', NULL, true, v_now, v_now);

  -- Core transactions (2+ months spread)
  INSERT INTO public.transactions
    ("Id","UserId","AccountId","DestinationAccountId","CategoryId","RecurringTransactionId","Type","Amount","Note","TransactionDate","IsRecurringGenerated","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_tx_salary_this_month, v_user_id, v_acc_main_bank, NULL, v_cat_salary, v_rec_salary, 1, 120000.00, 'Salary - This Month', date_trunc('month', v_now) + interval '1 day', true, v_now, v_now),
    (v_tx_salary_last_month, v_user_id, v_acc_main_bank, NULL, v_cat_salary, v_rec_salary, 1, 120000.00, 'Salary - Last Month', date_trunc('month', v_now) - interval '1 month' + interval '1 day', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_freelance, NULL, 1, 22000.00, 'Freelance Project', v_now - interval '41 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_bonus, NULL, 1, 15000.00, 'Performance Bonus', v_now - interval '19 days', false, v_now, v_now),

    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_rent, NULL, 2, 30000.00, 'House Rent', date_trunc('month', v_now) + interval '2 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_utilities, NULL, 2, 4200.00, 'Electricity Bill', v_now - interval '12 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_utilities, NULL, 2, 1800.00, 'Internet Bill', v_now - interval '9 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_subscriptions, v_rec_subscription, 2, 499.00, 'Prime Video', v_now - interval '6 days', true, v_now, v_now),
    (v_tx_uber_large, v_user_id, v_acc_main_bank, NULL, v_cat_transport, NULL, 2, 5600.00, 'Uber Airport Ride', v_now - interval '7 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_credit_card, NULL, v_cat_shopping, NULL, 2, 5400.00, 'Online Shopping', v_now - interval '8 days', false, v_now, v_now),
    (v_tx_food_tagged, v_user_id, v_acc_cash_wallet, NULL, v_cat_food, NULL, 2, 650.00, 'Swiggy dinner', v_now - interval '2 days', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_cash_wallet, NULL, v_cat_food, NULL, 2, 420.00, 'Cafe snacks', v_now - interval '1 day', false, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_main_bank, NULL, v_cat_travel, NULL, 2, 11000.00, 'Weekend Trip', v_now - interval '20 days', false, v_now, v_now),

    (gen_random_uuid(), v_user_id, v_acc_main_bank, v_acc_cash_wallet, NULL, NULL, 3, 5000.00, 'ATM Withdrawal', v_now - interval '15 days', false, v_now, v_now),
    (v_tx_transfer_sip, v_user_id, v_acc_main_bank, v_acc_investment, NULL, v_rec_sip_transfer, 3, 10000.00, 'Monthly SIP Transfer', v_now - interval '5 days', true, v_now, v_now),
    (gen_random_uuid(), v_user_id, v_acc_cash_wallet, v_acc_main_bank, NULL, NULL, 3, 1200.00, 'Cash Deposit', v_now - interval '3 days', false, v_now, v_now);

  -- Dense expense history for trend/report charts
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

  -- Rules (V2)
  INSERT INTO public.rules
    ("Id","UserId","Name","IsActive","Priority","ConditionType","ConditionValue","AmountThreshold","ActionType","ActionValue","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (v_rule_uber_to_transport, v_user_id, 'Uber -> Transport', true, 1, 1, 'uber', NULL, 1, v_cat_transport::text, v_now, v_now),
    (v_rule_high_amount_alert, v_user_id, 'Amount > 5000 -> Alert', true, 2, 2, NULL, 5000.00, 2, 'High-value transaction detected', v_now, v_now),
    (v_rule_food_tag, v_user_id, 'Food -> monthly-food tag', true, 3, 3, v_cat_food::text, NULL, 3, 'monthly-food', v_now, v_now),
    (v_rule_inactive_demo, v_user_id, 'Inactive demo rule', false, 50, 1, 'test', NULL, 2, 'Inactive rule should not fire', v_now, v_now);

  -- Sample rule outcomes (seeded so UI has positive data immediately)
  INSERT INTO public.transaction_alerts
    ("Id","UserId","TransactionId","Message","Severity","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (gen_random_uuid(), v_user_id, v_tx_uber_large, 'High-value transaction detected', 3, v_now, v_now);

  INSERT INTO public.transaction_tags
    ("Id","UserId","TransactionId","Tag","CreatedAtUtc","UpdatedAtUtc")
  VALUES
    (gen_random_uuid(), v_user_id, v_tx_food_tagged, 'monthly-food', v_now, v_now),
    (gen_random_uuid(), v_user_id, v_tx_transfer_sip, 'investment', v_now, v_now);

  RAISE NOTICE 'Realistic data seeded for user: %', target_email;
END $$;
