/*
  # Vehicle Management System Schema

  1. New Tables
    - vehicles: Main vehicle information
    - vehicle_documents: Document tracking
    - vehicle_maintenance: Maintenance history
    - vehicle_assignments: Driver assignments

  2. Features
    - Document expiry tracking
    - Maintenance history
    - Oil change tracking
    - Driver assignments
*/

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE vehicle_type AS ENUM ('moto', 'car', 'pickup', '4x4');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
    CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_type') THEN
    CREATE TYPE maintenance_type AS ENUM ('oil_change', 'repair', 'inspection', 'other');
  END IF;
END $$;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  license_plate text NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  color text,
  fuel_type fuel_type NOT NULL,
  current_mileage integer NOT NULL DEFAULT 0,
  first_use_date date NOT NULL,
  last_oil_change_km integer,
  next_oil_change_km integer,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle documents table
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (
    document_type = ANY (ARRAY[
      'insurance',
      'technical_visit',
      'sticker',
      'parking_card',
      'patente'
    ])
  ),
  expiry_date date NOT NULL,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_id, document_type)
);

-- Create vehicle maintenance table
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  maintenance_type maintenance_type NOT NULL,
  garage text,
  description text,
  mileage integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create vehicle assignments table
CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_expiry ON vehicle_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_date ON vehicle_maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_dates ON vehicle_assignments(start_date, end_date);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated access to vehicles"
  ON vehicles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vehicle_documents"
  ON vehicle_documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vehicle_maintenance"
  ON vehicle_maintenance FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vehicle_assignments"
  ON vehicle_assignments FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public) VALUES
  ('vehicle-photos', 'vehicle-photos', true),
  ('vehicle-documents', 'vehicle-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated access to vehicle photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'vehicle-photos')
  WITH CHECK (bucket_id = 'vehicle-photos');

CREATE POLICY "Allow authenticated access to vehicle documents"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'vehicle-documents')
  WITH CHECK (bucket_id = 'vehicle-documents');