/*
  # Facial Check-In System Setup

  1. Changes
    - Add facial_checkin_code to sites table
    - Create attendance_photos table for storing check-in photos
    - Add automatic photo cleanup function
    
  2. Features
    - Unique check-in codes per site
    - Photo storage with auto-cleanup
    - Attendance tracking with photos
*/

-- Add facial check-in code to sites table
ALTER TABLE sites
ADD COLUMN facial_checkin_code text UNIQUE,
ADD COLUMN facial_checkin_enabled boolean DEFAULT false;

-- Create function to generate random code
CREATE OR REPLACE FUNCTION generate_checkin_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create attendance photos table
CREATE TABLE IF NOT EXISTS attendance_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendance_records(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_type text CHECK (photo_type IN ('check_in', 'check_out')),
  created_at timestamptz DEFAULT now()
);

-- Create index for faster cleanup queries
CREATE INDEX idx_attendance_photos_created_at ON attendance_photos(created_at);

-- Create function to clean up old photos
CREATE OR REPLACE FUNCTION cleanup_old_photos()
RETURNS void AS $$
BEGIN
  -- Delete photos older than 60 days
  DELETE FROM attendance_photos
  WHERE created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate check-in code for new sites
CREATE OR REPLACE FUNCTION generate_site_checkin_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.facial_checkin_enabled AND NEW.facial_checkin_code IS NULL THEN
    LOOP
      NEW.facial_checkin_code := generate_checkin_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM sites WHERE facial_checkin_code = NEW.facial_checkin_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_checkin_code_trigger
BEFORE INSERT OR UPDATE ON sites
FOR EACH ROW
EXECUTE FUNCTION generate_site_checkin_code();

-- Enable RLS
ALTER TABLE attendance_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated access to attendance_photos"
  ON attendance_photos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Create storage bucket for attendance photos
INSERT INTO storage.buckets (id, name, public) VALUES
  ('attendance-photos', 'attendance-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Allow authenticated access to attendance photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'attendance-photos')
  WITH CHECK (bucket_id = 'attendance-photos');