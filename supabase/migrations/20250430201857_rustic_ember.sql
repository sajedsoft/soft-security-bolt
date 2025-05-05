/*
  # Add Agent Field to Main Courante

  1. Changes
    - Add agent_id column to incident_reports table
    - Add foreign key constraint to agents table
    - Update existing indexes
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add agent_id column to incident_reports
ALTER TABLE incident_reports
  ADD COLUMN agent_id uuid REFERENCES agents(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_incident_reports_agent_id 
ON incident_reports(agent_id);