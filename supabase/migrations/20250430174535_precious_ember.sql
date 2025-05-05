-- Add type and acknowledged columns to emergency_alerts table
ALTER TABLE emergency_alerts
ADD COLUMN type text NOT NULL CHECK (type IN ('danger', 'contact')) DEFAULT 'danger',
ADD COLUMN acknowledged boolean DEFAULT false,
ADD COLUMN message text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_timestamp 
ON emergency_alerts(timestamp DESC);