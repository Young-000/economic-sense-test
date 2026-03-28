-- =============================================================================
-- Migration: Tighten RLS policies on economic_sense_test.economic_rankings
-- Date: 2026-03-22
-- Purpose: The table already has RLS enabled with basic policies from
--          20260105_create_rankings.sql, but the INSERT policy uses
--          WITH CHECK (true) -- allowing arbitrary fake data.
--          This migration replaces the permissive INSERT policy with
--          validated bounds and adds explicit deny policies for UPDATE/DELETE.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure RLS is enabled (idempotent)
-- -----------------------------------------------------------------------------
ALTER TABLE economic_sense_test.economic_rankings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. SELECT policy: Keep existing (allow all for public leaderboard)
-- -----------------------------------------------------------------------------
-- The existing policy "Anyone can read rankings" is already correct.
-- Re-create it idempotently to ensure consistency.
DROP POLICY IF EXISTS "Anyone can read rankings" ON economic_sense_test.economic_rankings;
DROP POLICY IF EXISTS "rankings_select_all" ON economic_sense_test.economic_rankings;
CREATE POLICY "rankings_select_all"
  ON economic_sense_test.economic_rankings
  FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 3. INSERT policy: Replace permissive policy with validated bounds
-- -----------------------------------------------------------------------------
-- Validates that inserted data falls within reasonable game constraints:
--   - nickname: non-empty, max 50 chars
--   - final_balance: -100,000,000 to 100,000,000 (can go negative from losses)
--   - total_return: -1,000% to 10,000% (decimal, losses can exceed initial balance)
--   - risk_score: 0 to 100
--   - rationality_score: 0 to 100
--   - luck_score: -100 to +100 (domain entity: 운 점수 -100 ~ +100)
--   - investor_type: must be a known type (non-empty, max 50 chars)
--
-- NOTE on rate limiting:
--   RLS CHECK constraints cannot reliably do time-based rate limiting.
--   For production-grade rate limiting, consider:
--   - A Supabase Edge Function as an insert proxy with Redis/KV rate limiting
--   - A database trigger with a rate_limit helper table
--   - Vercel Edge Middleware throttling before the request reaches Supabase
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can insert rankings" ON economic_sense_test.economic_rankings;
DROP POLICY IF EXISTS "rankings_insert_validated" ON economic_sense_test.economic_rankings;
CREATE POLICY "rankings_insert_validated"
  ON economic_sense_test.economic_rankings
  FOR INSERT
  WITH CHECK (
    -- Nickname validation
    nickname IS NOT NULL
    AND length(trim(nickname)) >= 1
    AND length(nickname) <= 50

    -- Final balance bounds (can go negative from losses; starts at 10,000,000)
    AND final_balance >= -100000000
    AND final_balance <= 100000000

    -- Total return percentage bounds (can exceed -100% from compounding losses)
    AND total_return >= -1000.00
    AND total_return <= 10000.00

    -- Risk and rationality scores (0-100 range)
    AND risk_score >= 0
    AND risk_score <= 100
    AND rationality_score >= 0
    AND rationality_score <= 100

    -- Luck score (-100 to +100, per domain entity definition)
    AND luck_score >= -100
    AND luck_score <= 100

    -- Investor type must be a known type
    AND investor_type IS NOT NULL
    AND length(investor_type) <= 50
  );

-- -----------------------------------------------------------------------------
-- 4. UPDATE policy: Deny all
-- -----------------------------------------------------------------------------
-- Rankings are immutable once submitted. No updates allowed.
DROP POLICY IF EXISTS "rankings_update_none" ON economic_sense_test.economic_rankings;
CREATE POLICY "rankings_update_none"
  ON economic_sense_test.economic_rankings
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- -----------------------------------------------------------------------------
-- 5. DELETE policy: Deny all
-- -----------------------------------------------------------------------------
-- Rankings cannot be deleted by clients. Admin operations use service_role key.
DROP POLICY IF EXISTS "rankings_delete_none" ON economic_sense_test.economic_rankings;
CREATE POLICY "rankings_delete_none"
  ON economic_sense_test.economic_rankings
  FOR DELETE
  USING (false);

-- -----------------------------------------------------------------------------
-- 6. Add CHECK constraints on the table itself (defense in depth)
-- -----------------------------------------------------------------------------
-- These constraints apply regardless of RLS, catching any bypass via
-- service_role key or direct SQL. Using DO block for idempotency.
DO $$
BEGIN
  -- Final balance range constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_balance_range'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_balance_range
      CHECK (final_balance >= -100000000 AND final_balance <= 100000000);
  END IF;

  -- Total return range constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_return_range'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_return_range
      CHECK (total_return >= -1000.00 AND total_return <= 10000.00);
  END IF;

  -- Risk score range constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_risk_range'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_risk_range
      CHECK (risk_score >= 0 AND risk_score <= 100);
  END IF;

  -- Rationality score range constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_rationality_range'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_rationality_range
      CHECK (rationality_score >= 0 AND rationality_score <= 100);
  END IF;

  -- Luck score range constraint (-100 to +100)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_luck_range'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_luck_range
      CHECK (luck_score >= -100 AND luck_score <= 100);
  END IF;

  -- Nickname length constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'economic_rankings_nickname_length'
    AND conrelid = 'economic_sense_test.economic_rankings'::regclass
  ) THEN
    ALTER TABLE economic_sense_test.economic_rankings
      ADD CONSTRAINT economic_rankings_nickname_length
      CHECK (length(nickname) >= 1 AND length(nickname) <= 50);
  END IF;
END $$;
