-- Drop one of two identical indexes on economic_sense_test.economic_rankings (P1 ayibvijmjygujjieueny).
-- Company OS Phase 0, Task 0.7 item S3. Supabase advisor: duplicate_index.
--
-- Both indexes are btree (total_return DESC), non-unique, not backing a constraint
-- (checked 2026-10-17, read-only):
--   idx_economic_rankings_return    from 20260105_create_rankings.sql  (kept)
--   idx_rankings_total_return_desc  from 004_add_round_results.sql      (dropped here)
-- The planner uses whichever exists; dropping one removes the extra write cost and the lint.
-- The table is small (index 16 kB), so a plain DROP INDEX inside the migration transaction is fine.
--
-- Restore:
--   create index if not exists idx_rankings_total_return_desc
--     on economic_sense_test.economic_rankings (total_return desc);

do $$
begin
  if to_regclass('economic_sense_test.idx_economic_rankings_return') is null then
    raise exception 'kept index idx_economic_rankings_return is missing — refusing to drop its twin';
  end if;
end $$;

drop index if exists economic_sense_test.idx_rankings_total_return_desc;
