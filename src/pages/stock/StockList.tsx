import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import type { StockArticle, StockCategory } from '../../types/stock';

interface StockListProps {
  articles: StockArticle[];
  onEdit: (article: StockArticle) => void;
  onDelete: (id: string) => void;
  showLowStock: boolean;
  onToggleLowStock: () => void;
}

export default function StockList({ 
  articles, 
  onEdit, 
  onDelete,
  showLowStock,
  onToggleLowStock
}: StockListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    supplier: ''
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.reference_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || article.category === filters.category;
    const matchesSupplier = !filters.supplier || article.supplier?.id === filters.supplier;
    const matchesLowStock = !showLowStock || article.total_quantity <= article.critical_threshold;

    return matchesSearch && matchesCategory && matchesSupplier && matchesLowStock;
  });

  const uniqueSuppliers = Array.from(
    new Set(articles.map(a => a.supplier).filter(Boolean).map(s => ({ id: s!.id, name: s!.name })))
  );

  const getStockStatusStyle = (quantity: number, threshold: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= threshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const exportToExcel = () => {
    const data = filteredArticles.map(article => ({
      'Reference': article.reference_name,
      'Category': article.category,
      'Description': article.description || '',
      'Quantity': article.total_quantity,
      'Critical Threshold': article.critical_threshold,
      'Unit Price': article.unit_price || '',
      'Supplier': article.supplier?.name || '',
      'Variants': article.variants?.map(v => 
        `${v.size || ''} ${v.color || ''} (${v.quantity})`
      ).join(', ') || ''
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Stock');
    writeFile(wb, `stock-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            <option value="uniform">Uniform</option>
            <option value="equipment">Equipment</option>
            <option value="safety">Safety</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.supplier}
            onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Suppliers</option>
            {uniqueSuppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <button
            onClick={onToggleLowStock}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              showLowStock
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {showLowStock ? 'Show All Items' : 'Show Low Stock Only'}
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Article
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr 
                key={article.id} 
                className={`hover:bg-gray-50 ${
                  article.total_quantity <= article.critical_threshold
                    ? article.total_quantity === 0
                      ? 'bg-red-50'
                      : 'bg-yellow-50'
                    : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {article.photo_url && (
                      <img
                        src={article.photo_url}
                        alt={article.reference_name}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {article.reference_name}
                      </div>
                      {article.description && (
                        <div className="text-sm text-gray-500">
                          {article.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStockStatusStyle(article.total_quantity, article.critical_threshold)
                  }`}>
                    {article.total_quantity} units
                    {article.total_quantity <= article.critical_threshold && (
                      <span className="ml-1">(Low)</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.unit_price ? 
                    new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'XOF' 
                    }).format(article.unit_price) : 
                    '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {article.supplier?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {article.variants?.map((variant, index) => (
                      <div key={index} className="text-xs">
                        {variant.size} {variant.color} ({variant.quantity})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(article)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(article.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}