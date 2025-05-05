/*
  # Refresh marker_color column schema cache

  1. Changes
    - Recreate marker_color column to refresh schema cache
    - No data will be affected
    - Same constraints are maintained
*/

DO $$ 
BEGIN
  -- Only recreate if column exists to avoid errors
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'sites' 
    AND column_name = 'marker_color'
  ) THEN
    -- Recreate the column with the same definition
    ALTER TABLE sites 
    DROP COLUMN marker_color,
    ADD COLUMN marker_color text 
    CHECK (marker_color = ANY (ARRAY['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black']));
  END IF;
END $$;