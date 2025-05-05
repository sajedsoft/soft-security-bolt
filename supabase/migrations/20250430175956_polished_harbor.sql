-- Add equipment fields to sites table
ALTER TABLE sites
ADD COLUMN talkies_count integer DEFAULT 0,
ADD COLUMN phones_count integer DEFAULT 0,
ADD COLUMN qr_codes_count integer DEFAULT 0;

-- Update existing site_equipment table to include these fields
UPDATE sites s
SET 
  qr_codes_count = COALESCE(se.qr_codes_count, 0)
FROM site_equipment se
WHERE s.site_code = se.site_id;

-- Drop the now redundant site_equipment table
DROP TABLE IF EXISTS site_equipment CASCADE;