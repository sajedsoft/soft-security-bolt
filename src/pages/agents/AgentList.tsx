import { useState } from 'react';
import type { Agent } from '../../types/agent';
import { differenceInDays } from 'date-fns';

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onView: (agent: Agent) => void;
}

export default function AgentList({ agents, onEdit, onDelete, onView }: AgentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    contract_type: '',
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (agent.site_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = !filters.status || agent.status === filters.status;
    const matchesContractType = !filters.contract_type || agent.contract_type === filters.contract_type;

    return matchesSearch && matchesStatus && matchesContractType;
  });

  const checkContractEndDate = (agent: Agent) => {
    if (agent.contract_end_date) {
      const daysUntilEnd = differenceInDays(new Date(agent.contract_end_date), new Date());
      return daysUntilEnd <= 30 && daysUntilEnd > 0;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name, matricule, or site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="left">Left</option>
            </select>
          </div>
          <div>
            <select
              value={filters.contract_type}
              onChange={(e) => setFilters(prev => ({ ...prev, contract_type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Contract Types</option>
              <option value="cdd">CDD</option>
              <option value="cdi">CDI</option>
              <option value="intern">Intern</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAgents.map((agent) => (
              <tr 
                key={agent.id}
                className={checkContractEndDate(agent) ? 'bg-yellow-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {agent.photo_url && (
                      <img
                        src={agent.photo_url}
                        alt={agent.name}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.job_title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{agent.phone}</div>
                  <div className="text-sm text-gray-500">{agent.matricule || 'No matricule'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{agent.contract_type.toUpperCase()}</div>
                  {checkContractEndDate(agent) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Expires Soon
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    agent.status === 'active' ? 'bg-green-100 text-green-800' :
                    agent.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onView(agent)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(agent)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(agent.id)}
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