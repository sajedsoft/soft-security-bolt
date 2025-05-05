-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE activity_type AS ENUM ('industrial', 'construction', 'office', 'other');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
    CREATE TYPE risk_level AS ENUM ('standard', 'medium', 'high', 'very_high');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'site_status') THEN
    CREATE TYPE site_status AS ENUM ('active', 'inactive');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sim_provider') THEN
    CREATE TYPE sim_provider AS ENUM ('mtn', 'orange', 'moov');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_type') THEN
    CREATE TYPE incident_type AS ENUM ('regular', 'incident', 'alert', 'emergency');
  END IF;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  site_name text,
  site_code text,
  zone text,
  activity_type activity_type,
  day_agents_count integer DEFAULT 0,
  night_agents_count integer DEFAULT 0,
  has_team_leader boolean DEFAULT false,
  has_guard_dog boolean DEFAULT false,
  risk_level risk_level DEFAULT 'standard',
  status site_status DEFAULT 'active',
  contract_start_date date,
  contract_end_date date,
  contact_name text,
  contact_phone text,
  intermediary_name text,
  intermediary_phone text,
  group_id uuid,
  group_name text,
  instructions text,
  photo_url text,
  latitude numeric,
  longitude numeric,
  emergency_link_id uuid DEFAULT gen_random_uuid(),
  marker_color text CHECK (marker_color = ANY (ARRAY['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  job_title text NOT NULL,
  phone text NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN ('cdd', 'cdi', 'intern', 'trial')),
  start_date date NOT NULL,
  contract_end_date date,
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'left')),
  sex text CHECK (sex IN ('male', 'female')),
  date_of_birth date,
  place_of_birth text,
  matricule text,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  documents text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  job_title text,
  phone_number text,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  check_out timestamptz,
  status text CHECK (status IN ('present', 'absent', '24h')),
  is_replacement boolean DEFAULT false,
  comments text,
  total_hours numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  has_qr_codes boolean DEFAULT false,
  qr_codes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communication_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  type text CHECK (type IN ('talkie', 'phone')),
  imei text,
  brand text,
  phone_number text,
  sim_imei text,
  sim_provider sim_provider,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  latitude numeric,
  longitude numeric,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  agent_name text,
  description text NOT NULL,
  incident_type incident_type DEFAULT 'regular',
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_site_id ON agents(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_agent_id ON attendance_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_site_id ON attendance_records(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_incident_reports_site_id ON incident_reports(site_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at ON incident_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_site_id ON contacts(site_id);

-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Allow authenticated access to sites" ON sites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to agents" ON agents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to attendance_records" ON attendance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to site_equipment" ON site_equipment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to communication_devices" ON communication_devices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to site_history" ON site_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to emergency_alerts" ON emergency_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to incident_reports" ON incident_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage buckets
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO storage.buckets (id, name, public) VALUES
  ('agent-photos', 'agent-photos', true),
  ('agent-documents', 'agent-documents', true),
  ('site-photos', 'site-photos', true),
  ('incident-photos', 'incident-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated access to agent photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'agent-photos')
  WITH CHECK (bucket_id = 'agent-photos');

CREATE POLICY "Allow authenticated access to agent documents"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'agent-documents')
  WITH CHECK (bucket_id = 'agent-documents');

CREATE POLICY "Allow authenticated access to site photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'site-photos')
  WITH CHECK (bucket_id = 'site-photos');

CREATE POLICY "Allow authenticated access to incident photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'incident-photos')
  WITH CHECK (bucket_id = 'incident-photos');