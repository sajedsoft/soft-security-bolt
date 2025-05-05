/*
  # Update site references to use site_code

  1. Changes
    - Add NOT NULL constraint to site_code
    - Add UNIQUE constraint to site_code
    - Update foreign key references to use site_code
    - Modify existing relationships
    
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure site_code is required and unique
ALTER TABLE sites 
  ALTER COLUMN site_code SET NOT NULL,
  ADD CONSTRAINT sites_site_code_key UNIQUE (site_code);

-- Update agents table to reference site_code
ALTER TABLE agents 
  DROP CONSTRAINT IF EXISTS agents_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT agents_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE SET NULL;

-- Update attendance_records table
ALTER TABLE attendance_records 
  DROP CONSTRAINT IF EXISTS attendance_records_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT attendance_records_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE SET NULL;

-- Update contacts table
ALTER TABLE contacts 
  DROP CONSTRAINT IF EXISTS contacts_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT contacts_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update site_equipment table
ALTER TABLE site_equipment 
  DROP CONSTRAINT IF EXISTS site_equipment_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT site_equipment_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update communication_devices table
ALTER TABLE communication_devices 
  DROP CONSTRAINT IF EXISTS communication_devices_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT communication_devices_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update site_history table
ALTER TABLE site_history 
  DROP CONSTRAINT IF EXISTS site_history_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT site_history_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update emergency_alerts table
ALTER TABLE emergency_alerts 
  DROP CONSTRAINT IF EXISTS emergency_alerts_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT emergency_alerts_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update incident_reports table
ALTER TABLE incident_reports 
  DROP CONSTRAINT IF EXISTS incident_reports_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT incident_reports_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE CASCADE;

-- Update stock_assignments table
ALTER TABLE stock_assignments 
  DROP CONSTRAINT IF EXISTS stock_assignments_site_id_fkey,
  ALTER COLUMN site_id TYPE text USING site_id::text,
  ADD CONSTRAINT stock_assignments_site_id_fkey 
    FOREIGN KEY (site_id) 
    REFERENCES sites(site_code) 
    ON DELETE SET NULL;