import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { supabase } from '../../../lib/supabase';
import type { IncidentReport } from '../../../types/report';
import type { Site } from '../../../types/site';

export default function IncidentReportSection() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite && startDate && endDate) {
      fetchIncidentReports();
    }
  }, [selectedSite, startDate, endDate, selectedStatus]);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, site_name')
        .eq('status', 'active')
        .order('site_name');
      
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const fetchIncidentReports = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incident_reports')
        .select(`
          *,
          agent:agents(name),
          site:sites(site_name)
        `)
        .eq('site_id', selectedSite)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedReports: IncidentReport[] = (data || []).map(report => ({
        site_name: report.site?.site_name || 'Unknown Site',
        date: format(new Date(report.created_at), 'PPp'),
        incident_types: report.incident_types,
        description: report.description,
        agent_name: report.agent?.name || null,
        reported_by: report.reported_by || 'Unknown',
        resolution_details: report.resolution_details,
        status: report.status
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Failed to fetch incident reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(reports);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Incidents');
    writeFile(wb, `incident-report-${startDate}-to-${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select site</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.site_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="resolved">Resolved</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="unresolved">Unresolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : reports.length > 0 ? (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Export to Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.incident_types.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {report.description}
                      </div>
                      {report.resolution_details && (
                        <div className="mt-1 text-sm text-gray-500">
                          Resolution: {report.resolution_details}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.agent_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'escalated'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No incident reports found for the selected criteria
        </div>
      )}
    </div>
  );
}