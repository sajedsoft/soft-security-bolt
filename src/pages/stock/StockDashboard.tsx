import type { StockArticle } from '../../types/stock';

interface StockDashboardProps {
  articles: StockArticle[];
}

export default function StockDashboard({ articles }: StockDashboardProps) {
  const totalValue = articles.reduce((sum, article) => {
    return sum + (article.unit_price || 0) * article.total_quantity;
  }, 0);

  const lowStockCount = articles.filter(
    article => article.total_quantity <= article.critical_threshold
  ).length;

  const outOfStockCount = articles.filter(
    article => article.total_quantity === 0
  ).length;

  const categoryBreakdown = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + article.total_quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Total Stock Value</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'XOF' 
            }).format(totalValue)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Total Articles</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {articles.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Low Stock</h2>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {lowStockCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Out of Stock</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStockCount}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(categoryBreakdown).map(([category, quantity]) => (
            <div key={category} className="text-center">
              <div className="text-sm font-medium text-gray-500">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {quantity}
              </div>
              <div className="text-xs text-gray-500">units</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}