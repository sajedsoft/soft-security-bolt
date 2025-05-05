import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import type { Site, ActivityType, RiskLevel, SiteStatus } from '../../types/site';

interface SiteListProps {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
  onView: (site: Site) => void;
}

export default function SiteList({ sites, onEdit, onDelete, onView }: SiteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    risk_level: '',
    status: '',
    activity_type: ''
  });

  const filteredSites = sites.filter(site => {
    const matchesSearch = 
      (site.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (site.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesRiskLevel = !filters.risk_level || site.risk_level === filters.risk_level;
    const matchesStatus = !filters.status || site.status === filters.status;
    const matchesActivityType = !filters.activity_type || site.activity_type === filters.activity_type;

    return matchesSearch && matchesRiskLevel && matchesStatus && matchesActivityType;
  });

  const exportToExcel = () => {
    const data = filteredSites.map(site => ({
      'Company': site.company_name || '',
      'Site Name': site.site_name || '',
      'Activity Type': site.activity_type || '',
      'Risk Level': site.risk_level,
      'Status': site.status,
      'Day Agents': site.day_agents_count,
      'Night Agents': site.night_agents_count,
      'Contact': site.contact_name || '',
      'Phone': site.contact_phone || ''
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sites');
    writeFile(wb, `sites-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by site name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value as RiskLevel }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Risk Levels</option>
            <option value="standard">Standard</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as SiteStatus }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSites.map((site) => (
              <tr key={site.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {site.photo_url && (
                      <img
                        src={site.photo_url}
                        alt={site.site_name || 'Site'}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {site.site_name || 'Unnamed Site'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {site.company_name || 'No Company'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Day: {site.day_agents_count}</div>
                  <div>Night: {site.night_agents_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    site.risk_level === 'very_high' ? 'bg-red-100 text-red-800' :
                    site.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                    site.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {site.risk_level.replace('_', ' ').charAt(0).toUpperCase() + site.risk_level.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onView(site)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(site)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(site.id)}
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