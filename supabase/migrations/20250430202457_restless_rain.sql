/*
  # Contacts Module Enhancement
  
  1. Changes
    - Add email field to contacts table
    - Update existing constraints and indexes
    
  2. Features
    - Support for multiple contacts per site
    - Email address storage
*/

-- Add email field to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS email text;

-- Ensure indexes are optimized for multiple contacts
DROP INDEX IF EXISTS contacts_site_id_key;
CREATE INDEX IF NOT EXISTS idx_contacts_site_id ON contacts(site_id);