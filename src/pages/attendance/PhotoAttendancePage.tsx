import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';
import type { Site } from '../../types/site';
import type { Agent } from '../../types/agent';

interface AttendanceWithPhotos {
  id: string;
  agent: {
    name: string;
    photo_url: string | null;
  } | null;
  site: {
    site_name: string;
  } | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  photos: {
    id: string;
    photo_url: string;
    photo_type: 'check_in' | 'check_out';
  }[];
}

export default function PhotoAttendancePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [records, setRecords] = useState<AttendanceWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    const initializeConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setConnectionError(true);
        toast.error('Failed to connect to the database. Please try again later.');
        return;
      }
      fetchSites();
      fetchAgents();
    };

    initializeConnection();
  }, []);

  useEffect(() => {
    if (selectedDate && !connectionError) {
      fetchAttendanceRecords();
    }
  }, [selectedSite, selectedAgent, selectedDate, connectionError]);

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, site_name')
        .eq('status', 'active')
        .order('site_name');
      
      if (error) {
        console.error('Error fetching sites:', error);
        throw error;
      }
      setSites(data || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      toast.error('Failed to fetch sites. Please check your connection and try again.');
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error fetching agents:', error);
        throw error;
      }
      setAgents(data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to fetch agents. Please check your connection and try again.');
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance_records')
        .select(`
          id,
          agent:agents (name, photo_url),
          site:sites (site_name),
          date,
          check_in,
          check_out,
          status,
          photos:attendance_photos (
            id,
            photo_url,
            photo_type
          )
        `)
        .eq('date', selectedDate);

      if (selectedSite) {
        query = query.eq('site_id', selectedSite);
      }
      if (selectedAgent) {
        query = query.eq('agent_id', selectedAgent);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance records:', error);
        throw error;
      }
      
      setRecords(data || []);
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
      toast.error('Failed to fetch attendance records. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (record: AttendanceWithPhotos) => {
    if (record.status === 'absent') return 'Absent';
    if (!record.check_in && !record.check_out) return 'No Record';
    if (record.check_in && record.check_out) return 'Complete';
    if (record.check_in) return 'Only Checked In';
    if (record.check_out) return 'Only Checked Out';
    return 'Unknown';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Only Checked In':
        return 'bg-yellow-100 text-yellow-800';
      case 'Only Checked Out':
        return 'bg-orange-100 text-orange-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (connectionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600">
            Unable to connect to the database. Please check your internet connection and try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Attendance</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.site_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
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
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No attendance records found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => {
                const status = getAttendanceStatus(record);
                const checkInPhoto = record.photos?.find(p => p.photo_type === 'check_in');
                const checkOutPhoto = record.photos?.find(p => p.photo_type === 'check_out');

                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {record.agent?.photo_url && (
                          <img
                            src={record.agent.photo_url}
                            alt={record.agent.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {record.agent?.name || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.site?.site_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-900">
                          {record.check_in ? format(new Date(record.check_in), 'pp') : '-'}
                        </div>
                        {checkInPhoto && (
                          <button
                            onClick={() => setSelectedPhoto(checkInPhoto.photo_url)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Photo
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-900">
                          {record.check_out ? format(new Date(record.check_out), 'pp') : '-'}
                        </div>
                        {checkOutPhoto && (
                          <button
                            onClick={() => setSelectedPhoto(checkOutPhoto.photo_url)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Photo
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusStyle(status)
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg p-2">
            <img
              src={selectedPhoto}
              alt="Attendance"
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