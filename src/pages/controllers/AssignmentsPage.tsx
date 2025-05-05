import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { ControllerAssignment, Controller } from '../../types/controller';
import type { Site } from '../../types/site';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<ControllerAssignment[]>([]);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchControllers();
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAssignments();
    }
  }, [selectedDate]);

  const fetchControllers = async () => {
    try {
      const { data, error } = await supabase
        .from('controllers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setControllers(data || []);
    } catch (error) {
      console.error('Failed to fetch controllers:', error);
    }
  };

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

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('controller_assignments')
        .select(`
          *,
          site:sites (
            site_name
          )
        `)
        .eq('date', selectedDate)
        .order('created_at');
      
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assignments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (
    controllerId: string,
    siteId: string,
    comment?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('controller_assignments')
        .insert([{
          controller_id: controllerId,
          site_id: siteId,
          date: selectedDate,
          comment
        }])
        .select()
        .single();

      if (error) throw error;
      setAssignments(prev => [...prev, data]);
      toast.success('Assignment created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create assignment';
      toast.error(errorMessage);
    }
  };

  if (loading && !assignments.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !assignments.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Controller Assignments</h1>
        <Link
          to="/dashboard/controllers"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Controllers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Controller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const controller = controllers.find(c => c.id === assignment.controller_id);
              return (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {controller?.name || 'Unknown Controller'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.site?.site_name || 'Unknown Site'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.comment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/dashboard/controllers/assignments/${assignment.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}