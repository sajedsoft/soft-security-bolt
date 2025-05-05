-- Add landmark columns to sites table
ALTER TABLE sites 
ADD COLUMN landmark1 text,
ADD COLUMN landmark2 text,
ADD COLUMN landmark3 text;