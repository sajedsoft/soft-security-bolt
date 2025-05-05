/*
  # Enhanced Main Courante Schema Update
  
  1. Changes
    - Add new incident status type
    - Update incident_reports table with new fields
    - Add validation for incident types
    - Add performance indexes
    
  2. Features
    - Multi-select incident types
    - Resolution tracking
    - Status management
*/

-- Create new incident status type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
    CREATE TYPE incident_status AS ENUM (
      'resolved',
      'in_progress',
      'escalated',
      'unresolved'
    );
  END IF;
END $$;

-- Update incident_reports table
ALTER TABLE incident_reports
  -- First modify the incident_type column to be nullable
  ALTER COLUMN incident_type DROP NOT NULL;

-- Add new columns
ALTER TABLE incident_reports
  ADD COLUMN IF NOT EXISTS incident_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS other_incident_type text,
  ADD COLUMN IF NOT EXISTS reported_by text,
  ADD COLUMN IF NOT EXISTS resolution_details text,
  ADD COLUMN IF NOT EXISTS status incident_status;

-- Add constraint for incident types
ALTER TABLE incident_reports
  ADD CONSTRAINT valid_incident_types CHECK (
    incident_types <@ ARRAY[
      'internal_theft',
      'external_theft',
      'staff_delay',
      'fire',
      'agent_abandoning_post',
      'sleeping_agent',
      'agent_bad_posture',
      'non_compliance',
      'hygiene_problem',
      'communication_problem',
      'client_complaint',
      'insubordination',
      'other'
    ]
  );

-- Set default status for existing records
UPDATE incident_reports 
SET status = 'unresolved'::incident_status 
WHERE status IS NULL;

-- Make status required after setting defaults
ALTER TABLE incident_reports
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'unresolved'::incident_status;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_incident_reports_status 
ON incident_reports(status);

-- Now we can safely drop the old incident_type column
ALTER TABLE incident_reports DROP COLUMN IF EXISTS incident_type;