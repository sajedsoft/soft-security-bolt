import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { StockArticle, StockEntry, StockVariant } from '../../types/stock';

interface StockEntryFormProps {
  onSubmit: (data: Partial<StockEntry>) => void;
  onCancel: () => void;
}

export default function StockEntryForm({ onSubmit, onCancel }: StockEntryFormProps) {
  const [formData, setFormData] = useState<Partial<StockEntry>>({
    operation_date: new Date().toISOString(),
    quantity: 1
  });
  const [articles, setArticles] = useState<StockArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<StockArticle | null>(null);
  const [variants, setVariants] = useState<StockVariant[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_articles')
        .select('*, stock_variants(*)')
        .order('reference_name');
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'article_id') {
      const article = articles.find(a => a.id === value);
      setSelectedArticle(article || null);
      setVariants(article?.variants || []);
      setFormData(prev => ({ ...prev, article_id: value, variant_id: null }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Article *</label>
          <select
            name="article_id"
            required
            value={formData.article_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select article</option>
            {articles.map(article => (
              <option key={article.id} value={article.id}>
                {article.reference_name}
              </option>
            ))}
          </select>
        </div>

        {variants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Variant</label>
            <select
              name="variant_id"
              value={formData.variant_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select variant</option>
              {variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.size} {variant.color}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            name="quantity"
            required
            min="1"
            value={formData.quantity || 1}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input
            type="datetime-local"
            name="operation_date"
            required
            value={formData.operation_date?.slice(0, 16) || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Price</label>
          <input
            type="number"
            name="unit_price"
            step="0.01"
            min="0"
            value={formData.unit_price || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Manager Name *</label>
          <input
            type="text"
            name="manager_name"
            required
            value={formData.manager_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            name="comments"
            value={formData.comments || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
        >
          Record Entry
        </button>
      </div>
    </form>
  );
}