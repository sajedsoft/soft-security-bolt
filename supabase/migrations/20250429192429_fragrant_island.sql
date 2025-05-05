/*
  # Stock Management Module Setup

  1. New Tables
    - stock_articles: Main stock items
    - stock_variants: Size/model variants
    - stock_entries: Incoming stock
    - stock_outputs: Outgoing stock
    - stock_suppliers: Supplier information
    - stock_alerts: Low stock alerts
    - stock_assignments: Agent assignments

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users only
    
  3. Storage
    - stock-photos bucket for article images
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
CREATE TABLE IF NOT EXISTS stock_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category stock_category NOT NULL,
  reference_name text NOT NULL,
  description text,
  total_quantity integer DEFAULT 0,
  critical_threshold integer DEFAULT 5,
  supplier_id uuid REFERENCES stock_suppliers(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS stock_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES stock_variants(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  assignment_date timestamptz DEFAULT now(),
  return_date timestamptz,
  manager_name text NOT NULL,
  status text CHECK (status IN ('assigned', 'returned', 'lost')) DEFAULT 'assigned',
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES stock_articles(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES stock_variants(id) ON DELETE CASCADE,
  current_quantity integer NOT NULL,
  threshold_reached timestamptz DEFAULT now(),
  status text CHECK (status IN ('pending', 'addressed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_articles_category ON stock_articles(category);
CREATE INDEX IF NOT EXISTS idx_stock_articles_supplier ON stock_articles(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_variants_article ON stock_variants(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_article ON stock_entries(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_outputs_article ON stock_outputs(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_assignments_agent ON stock_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_stock_assignments_site ON stock_assignments(site_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_article ON stock_alerts(article_id);

-- Enable RLS
ALTER TABLE stock_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated access to stock_suppliers" ON stock_suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_articles" ON stock_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_variants" ON stock_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_entries" ON stock_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_outputs" ON stock_outputs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_assignments" ON stock_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to stock_alerts" ON stock_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES
  ('stock-photos', 'stock-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Allow authenticated access to stock photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'stock-photos')
  WITH CHECK (bucket_id = 'stock-photos');

-- Create triggers for stock management
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update article and variant quantities
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'stock_entries' THEN
      -- Increase stock for entries
      UPDATE stock_articles 
      SET total_quantity = total_quantity + NEW.quantity
      WHERE id = NEW.article_id;
      
      IF NEW.variant_id IS NOT NULL THEN
        UPDATE stock_variants
        SET quantity = quantity + NEW.quantity
        WHERE id = NEW.variant_id;
      END IF;
    ELSIF TG_TABLE_NAME = 'stock_outputs' THEN
      -- Decrease stock for outputs
      UPDATE stock_articles 
      SET total_quantity = total_quantity - NEW.quantity
      WHERE id = NEW.article_id;
      
      IF NEW.variant_id IS NOT NULL THEN
        UPDATE stock_variants
        SET quantity = quantity - NEW.quantity
        WHERE id = NEW.variant_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_entries_trigger
AFTER INSERT ON stock_entries
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

CREATE TRIGGER stock_outputs_trigger
AFTER INSERT ON stock_outputs
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

-- Create function for stock alerts
CREATE OR REPLACE FUNCTION check_stock_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quantity is below threshold
  IF NEW.total_quantity <= NEW.critical_threshold THEN
    INSERT INTO stock_alerts (
      article_id,
      current_quantity,
      status
    ) VALUES (
      NEW.id,
      NEW.total_quantity,
      'pending'
    ) ON CONFLICT (article_id) DO UPDATE
    SET current_quantity = NEW.total_quantity,
        updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_threshold_trigger
AFTER UPDATE OF total_quantity ON stock_articles
FOR EACH ROW
EXECUTE FUNCTION check_stock_threshold();