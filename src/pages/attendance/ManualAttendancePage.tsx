import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { utils, writeFile } from 'xlsx';
import { supabase } from '../../lib/supabase';
import type { Site } from '../../types/site';
import type { Agent } from '../../types/agent';
import type { AttendanceRecord } from '../../types/attendance';

export default function ManualAttendancePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchSites();
    if (selectedSite) {
      fetchAgents(selectedSite);
      fetchTodayRecords(selectedSite);
    }
  }, [selectedSite]);

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
      toast.error('Failed to fetch sites');
    }
  };

  const fetchAgents = async (siteId: string) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, photo_url')
        .eq('site_id', siteId)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      toast.error('Failed to fetch agents');
    }
  };

  const fetchTodayRecords = async (siteId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('site_id', siteId)
        .eq('date', today);
      
      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      toast.error('Failed to fetch today\'s records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (agentId: string) => {
    try {
      const existingRecord = records.find(r => 
        r.agent_id === agentId && !r.check_out
      );

      if (existingRecord) {
        toast.error('Agent already checked in');
        return;
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
          agent_id: agentId,
          site_id: selectedSite,
          date: new Date().toISOString().split('T')[0],
          check_in: new Date().toISOString(),
          status: 'present',
          comments: comments[agentId] || null
        }])
        .select()
        .single();

      if (error) throw error;
      setRecords([...records, data]);
      setComments(prev => ({ ...prev, [agentId]: '' }));
      toast.success('Check-in recorded');
    } catch (error) {
      toast.error('Failed to record check-in');
    }
  };

  const handleCheckOut = async (recordId: string) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (!record || !record.check_in) return;

      const checkOut = new Date().toISOString();
      const checkIn = new Date(record.check_in);
      const totalHours = (new Date(checkOut).getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out: checkOut,
          total_hours: totalHours,
          comments: comments[record.agent_id] || record.comments
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      setRecords(records.map(r => r.id === recordId ? data : r));
      setComments(prev => ({ ...prev, [record.agent_id]: '' }));
      toast.success('Check-out recorded');
    } catch (error) {
      toast.error('Failed to record check-out');
    }
  };

  const handleExport = () => {
    const site = sites.find(s => s.id === selectedSite);
    if (!site) return;

    const data = records.map(record => {
      const agent = agents.find(a => a.id === record.agent_id);
      return {
        'Date': format(new Date(record.date), 'PP'),
        'Agent': agent?.name || '',
        'Check In': record.check_in ? format(new Date(record.check_in), 'pp') : '',
        'Check Out': record.check_out ? format(new Date(record.check_out), 'pp') : '',
        'Total Hours': record.total_hours?.toFixed(2) || '',
        'Comments': record.comments || ''
      };
    });

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Attendance');
    writeFile(wb, `attendance-${site.site_name}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Attendance</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          {selectedSite && (
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Export
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="max-w-xl">
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
      </div>

      {selectedSite && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {agents.map(agent => {
              const record = records.find(r => 
                r.agent_id === agent.id && !r.check_out
              );

              return (
                <div key={agent.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {agent.photo_url && (
                        <img
                          src={agent.photo_url}
                          alt={agent.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {agent.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={comments[agent.id] || ''}
                        onChange={(e) => setComments(prev => ({
                          ...prev,
                          [agent.id]: e.target.value
                        }))}
                        placeholder="Add comment..."
                        className="px-3 py-1 border rounded-md text-sm"
                      />
                      {record ? (
                        <button
                          onClick={() => handleCheckOut(record.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          DÉPART
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(agent.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          ARRIVÉE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { ManualAttendancePage }