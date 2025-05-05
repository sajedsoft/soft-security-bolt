export type StockCategory = 'uniform' | 'equipment' | 'safety' | 'office' | 'other';
export type StockOperationType = 'entry' | 'output' | 'return' | 'loss';

export interface StockArticle {
  id: string;
  category: StockCategory;
  reference_name: string;
  description?: string;
  total_quantity: number;
  critical_threshold: number;
  supplier_id?: string;
  photo_url?: string;
  unit_price?: number;
  created_at?: string;
  updated_at?: string;
  supplier?: StockSupplier;
  variants?: StockVariant[];
}

export interface StockVariant {
  id: string;
  article_id: string;
  size?: string;
  color?: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockSupplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockEntry {
  id: string;
  article_id: string;
  variant_id?: string;
  quantity: number;
  operation_date: string;
  manager_name: string;
  unit_price?: number;
  invoice_number?: string;
  comments?: string;
  created_at?: string;
}

export interface StockOutput {
  id: string;
  article_id: string;
  variant_id?: string;
  quantity: number;
  operation_date: string;
  manager_name: string;
  operation_type: StockOperationType;
  comments?: string;
  created_at?: string;
}

export interface StockAlert {
  id: string;
  article_id: string;
  variant_id?: string;
  current_quantity: number;
  threshold_reached: string;
  status: 'pending' | 'addressed';
  created_at?: string;
  updated_at?: string;
}