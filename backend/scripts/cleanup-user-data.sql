-- User-scoped cleanup
-- Purpose: remove only one user's app data, keep schema/tables and other users untouched.
-- Usage: set target_email and run in Supabase SQL Editor.

DO $$
DECLARE
  target_email text := 'replace-with-your-email@example.com';
  v_user_id uuid;
BEGIN
  SELECT u."Id" INTO v_user_id
  FROM public.users u
  WHERE lower(u."Email") = lower(target_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email: %', target_email;
  END IF;

  DELETE FROM public.transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.recurring_transactions WHERE "UserId" = v_user_id;
  DELETE FROM public.budgets WHERE "UserId" = v_user_id;
  DELETE FROM public.goals WHERE "UserId" = v_user_id;
  DELETE FROM public.password_reset_tokens WHERE "UserId" = v_user_id;
  DELETE FROM public.refresh_tokens WHERE "UserId" = v_user_id;
  DELETE FROM public.categories WHERE "UserId" = v_user_id;
  DELETE FROM public.accounts WHERE "UserId" = v_user_id;

  RAISE NOTICE 'Cleanup complete for user: %', target_email;
END $$;
