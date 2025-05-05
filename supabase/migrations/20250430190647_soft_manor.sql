/*
  # Remove site_code and update references

  1. Changes
    - Remove site_code column from sites table
    - Update all foreign key references to use site id
    - Drop related constraints and indexes
*/

-- Remove site_code column and related constraints
ALTER TABLE sites
DROP COLUMN IF EXISTS site_code CASCADE;

-- Update foreign key references in other tables to use site id
ALTER TABLE agents
DROP CONSTRAINT IF EXISTS agents_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT agents_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE SET NULL;

ALTER TABLE attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT attendance_records_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE SET NULL;

ALTER TABLE contacts
DROP CONSTRAINT IF EXISTS contacts_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT contacts_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE CASCADE;

ALTER TABLE communication_devices
DROP CONSTRAINT IF EXISTS communication_devices_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT communication_devices_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE CASCADE;

ALTER TABLE site_history
DROP CONSTRAINT IF EXISTS site_history_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT site_history_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE CASCADE;

ALTER TABLE emergency_alerts
DROP CONSTRAINT IF EXISTS emergency_alerts_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT emergency_alerts_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE CASCADE;

ALTER TABLE incident_reports
DROP CONSTRAINT IF EXISTS incident_reports_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT incident_reports_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE CASCADE;

ALTER TABLE stock_assignments
DROP CONSTRAINT IF EXISTS stock_assignments_site_id_fkey,
ALTER COLUMN site_id TYPE uuid USING site_id::uuid,
ADD CONSTRAINT stock_assignments_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES sites(id) 
  ON DELETE SET NULL;