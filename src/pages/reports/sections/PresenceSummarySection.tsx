import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { supabase } from '../../../lib/supabase';
import type { PresenceSummary } from '../../../types/report';

export default function PresenceSummarySection() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summaries, setSummaries] = useState<PresenceSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchPresenceSummary();
    }
  }, [selectedDate]);

  const fetchPresenceSummary = async () => {
    try {
      setLoading(true);

      // First get all active sites
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('id, site_name, day_agents_count')
        .eq('status', 'active');

      if (sitesError) throw sitesError;

      // Then get attendance records for each site
      const summaryPromises = (sites || []).map(async (site) => {
        const { data: records, error: recordsError } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('site_id', site.id)
          .eq('date', selectedDate);

        if (recordsError) throw recordsError;

        const present = records?.filter(r => r.status === 'present').length || 0;
        const absent = records?.filter(r => r.status === 'absent').length || 0;

        return {
          site_name: site.site_name || 'Unknown Site',
          total_agents: site.day_agents_count || 0,
          present,
          absent,
          date: format(new Date(selectedDate), 'PP')
        };
      });

      const summaryResults = await Promise.all(summaryPromises);
      setSummaries(summaryResults);
    } catch (error) {
      console.error('Failed to fetch presence summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(summaries);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Presence Summary');
    writeFile(wb, `presence-summary-${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        {summaries.length > 0 && (
          <button
            onClick={exportToExcel}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Export to Excel
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary, index) => (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {summary.site_name}
                </h3>
                <dl className="mt-5 grid grid-cols-1 gap-5">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Required Agents
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {summary.total_agents}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Present
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-green-600">
                        {summary.present}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Absent
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-red-600">
                        {summary.absent}
                      </dd>
                    </div>
                  </div>
                </dl>
                {summary.present < summary.total_agents && (
                  <div className="mt-4">
                    <p className="text-sm text-red-600">
                      Site is understaffed by {summary.total_agents - summary.present} agents
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No presence data found for the selected date
        </div>
      )}
    </div>
  );
}