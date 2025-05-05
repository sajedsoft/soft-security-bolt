import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { supabase } from '../../../lib/supabase';
import type { AttendanceReport } from '../../../types/report';
import type { Site } from '../../../types/site';

export default function AttendanceReportSection() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite && selectedDate) {
      fetchAttendanceReports();
    }
  }, [selectedSite, selectedDate]);

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sites';
      console.error(errorMessage);
    }
  };

  const fetchAttendanceReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          agent:agents(name),
          site:sites(site_name)
        `)
        .eq('site_id', selectedSite)
        .eq('date', selectedDate);

      if (error) throw error;

      const formattedReports: AttendanceReport[] = (data || []).map(record => ({
        site_name: record.site?.site_name || 'Unknown Site',
        date: format(new Date(record.date), 'PP'),
        agent_name: record.agent?.name || 'Unknown Agent',
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        total_hours: record.total_hours
      }));

      setReports(formattedReports);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance reports';
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(reports);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Attendance');
    writeFile(wb, `attendance-report-${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
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
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.agent_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.check_in ? format(new Date(report.check_in), 'pp') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.check_out ? format(new Date(report.check_out), 'pp') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.total_hours ? `${report.total_hours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status.toUpperCase()}
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
          No attendance records found for the selected criteria
        </div>
      )}
    </div>
  );
}