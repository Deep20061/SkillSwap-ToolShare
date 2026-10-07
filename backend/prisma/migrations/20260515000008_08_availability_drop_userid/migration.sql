-- Drop userId FK and column from availability now that slots are owned by listings.
-- Any existing rows with userId set are orphaned (profile availability was stripped
-- from the API) — safe to drop.

ALTER TABLE "availability" DROP CONSTRAINT IF EXISTS "availability_userId_fkey";
DROP INDEX IF EXISTS "availability_userId_idx";
DROP INDEX IF EXISTS "availability_userId_dayOfWeek_startTime_key";
ALTER TABLE "availability" DROP COLUMN IF EXISTS "userId";
