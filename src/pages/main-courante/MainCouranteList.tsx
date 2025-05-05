import { useState } from 'react';
import { format } from 'date-fns';
import type { IncidentReport } from '../../types/incident';

interface MainCouranteListProps {
  reports: IncidentReport[];
  onEdit: (report: IncidentReport) => void;
  onDelete: (id: string) => void;
}

export default function MainCouranteList({ reports, onEdit, onDelete }: MainCouranteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    site: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      (report.site?.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (report.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSite = !filters.site || report.site?.site_name === filters.site;
    const matchesType = !filters.type || report.incident_type === filters.type;
    
    const reportDate = new Date(report.created_at);
    const matchesDateFrom = !filters.dateFrom || reportDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || reportDate <= new Date(filters.dateTo);

    return matchesSearch && matchesSite && matchesType && matchesDateFrom && matchesDateTo;
  });

  const uniqueSites = Array.from(new Set(reports.map(r => r.site?.site_name).filter(Boolean)));

  const getIncidentTypeStyle = (type: string | undefined) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800 animate-pulse';
      case 'alert':
        return 'bg-red-50 text-red-700';
      case 'incident':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <select
            value={filters.site}
            onChange={(e) => setFilters(prev => ({ ...prev, site: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Sites</option>
            {uniqueSites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Types</option>
            <option value="regular">Regular Event</option>
            <option value="incident">Incident</option>
            <option value="alert">Alert</option>
            <option value="emergency">Emergency</option>
          </select>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-1/2 px-3 py-2 border rounded-md"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-1/2 px-3 py-2 border rounded-md"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(report.created_at), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.site?.site_name || 'Unknown Site'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.agent_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getIncidentTypeStyle(report.incident_type)
                  }`}>
                    {report.incident_type ? 
                      report.incident_type.charAt(0).toUpperCase() + report.incident_type.slice(1) 
                      : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">{report.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.photo_url && (
                    <div className="relative">
                      <img
                        src={report.photo_url}
                        alt="Incident"
                        className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-75"
                        onClick={() => setSelectedPhoto(report.photo_url)}
                      />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(report)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(report.id)}
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

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg p-2">
            <img
              src={selectedPhoto}
              alt="Full size"
              className="max-w-full h-auto"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}