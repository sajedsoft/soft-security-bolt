/*
  # Stock Management System Setup

  1. New Types
    - stock_category enum for article categorization
    - stock_operation_type enum for output operations

  2. Tables
    - stock_articles: Main inventory items
    - stock_variants: Size/color variants of articles
    - stock_entries: Incoming stock records
    - stock_outputs: Outgoing stock records
    - stock_alerts: Low stock notifications

  3. Features
    - Automatic stock quantity updates
    - Low stock threshold monitoring
    - Variant tracking
    - Price tracking
*/

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_category') THEN
    CREATE TYPE stock_category AS ENUM ('uniform', 'equipment', 'safety', 'office', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_operation_type') THEN
    CREATE TYPE stock_operation_type AS ENUM ('entry', 'output', 'return', 'loss');
  END IF;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS stock_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category stock_category NOT NULL,
  reference_name text NOT NULL,
  description text,
  total_quantity integer DEFAULT 0,
  critical_threshold integer DEFAULT 5,
  supplier_id uuid,
  photo_url text,
  unit_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE CASCADE,
  size text,
  color text,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(article_id, size, color)
);

CREATE TABLE IF NOT EXISTS stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES stock_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  operation_date timestamptz DEFAULT now(),
  manager_name text NOT NULL,
  unit_price numeric(10,2),
  invoice_number text,
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES stock_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  operation_date timestamptz DEFAULT now(),
  manager_name text NOT NULL,
  operation_type stock_operation_type DEFAULT 'output',
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES stock_variants(id) ON DELETE CASCADE,
  current_quantity integer NOT NULL,
  threshold_reached timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'addressed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_variants_article ON stock_variants(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_article ON stock_entries(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_outputs_article ON stock_outputs(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_article ON stock_alerts(article_id);

-- Enable RLS
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name LIKE 'stock_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Drop existing policies if they exist
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name LIKE 'stock_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated access to %I" ON %I', t, t);
  END LOOP;
END $$;

-- Create new policies
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name LIKE 'stock_%'
  LOOP
    EXECUTE format(
      'CREATE POLICY "Allow authenticated access to %I" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END $$;

-- Create trigger function to update stock quantities
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'stock_entries' THEN
      -- Update variant quantity if exists
      IF NEW.variant_id IS NOT NULL THEN
        UPDATE stock_variants 
        SET quantity = quantity + NEW.quantity
        WHERE id = NEW.variant_id;
      END IF;
      
      -- Update total article quantity
      UPDATE stock_articles 
      SET total_quantity = total_quantity + NEW.quantity
      WHERE id = NEW.article_id;
      
    ELSIF TG_TABLE_NAME = 'stock_outputs' THEN
      -- Update variant quantity if exists
      IF NEW.variant_id IS NOT NULL THEN
        UPDATE stock_variants 
        SET quantity = quantity - NEW.quantity
        WHERE id = NEW.variant_id;
      END IF;
      
      -- Update total article quantity
      UPDATE stock_articles 
      SET total_quantity = total_quantity - NEW.quantity
      WHERE id = NEW.article_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to check stock threshold
CREATE OR REPLACE FUNCTION check_stock_threshold()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_quantity <= NEW.critical_threshold THEN
    INSERT INTO stock_alerts (
      article_id,
      current_quantity,
      threshold_reached,
      status
    ) VALUES (
      NEW.id,
      NEW.total_quantity,
      now(),
      'pending'
    )
    ON CONFLICT (article_id) DO UPDATE
    SET current_quantity = NEW.total_quantity,
        threshold_reached = now(),
        status = 'pending',
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS stock_entries_trigger ON stock_entries;
DROP TRIGGER IF EXISTS stock_outputs_trigger ON stock_outputs;
DROP TRIGGER IF EXISTS stock_threshold_trigger ON stock_articles;

CREATE TRIGGER stock_entries_trigger
AFTER INSERT ON stock_entries
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

CREATE TRIGGER stock_outputs_trigger
AFTER INSERT ON stock_outputs
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

CREATE TRIGGER stock_threshold_trigger
AFTER UPDATE OF total_quantity ON stock_articles
FOR EACH ROW
EXECUTE FUNCTION check_stock_threshold();