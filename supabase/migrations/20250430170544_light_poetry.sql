-- Remove zone column from sites table
ALTER TABLE sites DROP COLUMN IF EXISTS zone;