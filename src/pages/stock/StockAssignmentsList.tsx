import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { StockAssignment } from '../../types/stock';
import type { Agent } from '../../types/agent';

interface StockAssignmentsListProps {
  onClose: () => void;
}

export default function StockAssignmentsList({ onClose }: StockAssignmentsListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [assignments, setAssignments] = useState<StockAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAssignments(selectedAgent);
    }
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, photo_url')
        .order('name');
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchAssignments = async (agentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_assignments')
        .select(`
          id,
          agent_id,
          article_id,
          variant_id,
          site_id,
          quantity,
          assignment_date,
          manager_name,
          status,
          comments,
          article:stock_articles (
            reference_name,
            category
          ),
          variant:stock_variants (
            size,
            color
          ),
          site:sites (
            site_name
          )
        `)
        .eq('agent_id', agentId)
        .eq('status', 'assigned')
        .order('assignment_date', { ascending: false });
      
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">View Assigned Items</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select an agent to view their assigned items
          </p>
        </div>

        <div className="mb-6">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select an agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : selectedAgent && assignments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No items assigned to this agent
          </div>
        ) : assignments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.article?.reference_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.article?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.variant ? (
                        `${assignment.variant.size || ''} ${assignment.variant.color || ''}`
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.site?.site_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(assignment.assignment_date), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.manager_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}