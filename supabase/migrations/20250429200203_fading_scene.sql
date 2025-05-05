-- Create tables first
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  photo_url text,
  alert_threshold integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  size text,
  color text,
  available_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(article_id, size, color)
);

CREATE TABLE IF NOT EXISTS stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES article_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  entry_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES article_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  output_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_article_variants_article ON article_variants(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_variant ON stock_entries(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_outputs_variant ON stock_outputs(variant_id);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_outputs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated access to articles" ON articles;
DROP POLICY IF EXISTS "Allow authenticated access to article_variants" ON article_variants;
DROP POLICY IF EXISTS "Allow authenticated access to stock_entries" ON stock_entries;
DROP POLICY IF EXISTS "Allow authenticated access to stock_outputs" ON stock_outputs;

-- Create policies
CREATE POLICY "Allow authenticated access to articles"
  ON articles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to article_variants"
  ON article_variants FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to stock_entries"
  ON stock_entries FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated access to stock_outputs"
  ON stock_outputs FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Create trigger function to update stock quantities
CREATE OR REPLACE FUNCTION update_variant_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'stock_entries' THEN
      UPDATE article_variants 
      SET available_quantity = available_quantity + NEW.quantity
      WHERE id = NEW.variant_id;
    ELSIF TG_TABLE_NAME = 'stock_outputs' THEN
      UPDATE article_variants 
      SET available_quantity = available_quantity - NEW.quantity
      WHERE id = NEW.variant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS stock_entries_trigger ON stock_entries;
DROP TRIGGER IF EXISTS stock_outputs_trigger ON stock_outputs;

CREATE TRIGGER stock_entries_trigger
AFTER INSERT ON stock_entries
FOR EACH ROW
EXECUTE FUNCTION update_variant_quantity();

CREATE TRIGGER stock_outputs_trigger
AFTER INSERT ON stock_outputs
FOR EACH ROW
EXECUTE FUNCTION update_variant_quantity();