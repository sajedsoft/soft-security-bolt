import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { StockArticle, StockEntry, StockOutput } from '../../types/stock';
import StockDashboard from './StockDashboard';
import StockList from './StockList';
import StockForm from './StockForm';

export default function StockPage() {
  const [articles, setArticles] = useState<StockArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<StockArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_articles')
        .select(`
          *,
          supplier:stock_suppliers (*),
          variants:stock_variants (*)
        `)
        .order('reference_name');
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async (articleData: Partial<StockArticle>, photo: File | null) => {
    try {
      setLoading(true);
      
      let photo_url = null;
      if (photo) {
        const { data: photoData, error: photoError } = await supabase.storage
          .from('stock-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('stock-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('stock_articles')
        .insert([{
          ...articleData,
          photo_url
        }])
        .select()
        .single();

      if (error) throw error;

      setArticles(prevArticles => [...prevArticles, data]);
      setShowForm(false);
      toast.success('Article added successfully');
      
      fetchArticles();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add article';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !articles.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !articles.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setSelectedArticle(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Article
          </button>
        </div>
      </div>

      <StockDashboard articles={articles} />

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <StockForm
            onSubmit={handleAddArticle}
            onCancel={() => {
              setShowForm(false);
              setSelectedArticle(null);
            }}
            initialData={selectedArticle || undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <StockList
            articles={articles}
            onEdit={(article) => {
              setSelectedArticle(article);
              setShowForm(true);
            }}
          />
        </div>
      )}
    </div>
  );
}