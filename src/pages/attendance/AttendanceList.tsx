import { useState } from 'react';
import { format } from 'date-fns';
import type { AttendanceRecord, AgentWithSite } from '../../types/attendance';

interface AttendanceListProps {
  records: AttendanceRecord[];
  agents: AgentWithSite[];
  onCheckIn: (agentId: string, siteId: string) => void;
  onCheckOut: (recordId: string) => void;
  onMarkAbsent: (agentId: string, siteId: string) => void;
  onDelete: (id: string) => void;
}

export default function AttendanceList({
  records,
  agents,
  onCheckIn,
  onCheckOut,
  onMarkAbsent,
  onDelete
}: AttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusStyle = (status: string, totalHours: number | null) => {
    if (status === '24h' || (totalHours && totalHours > 24)) {
      return 'bg-red-100 text-red-800 animate-pulse';
    }
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Show unrecorded agents first */}
            {agents.map((agent) => {
              const todayRecord = records.find(r => r.agent_id === agent.id);

              if (!todayRecord && agent.site_id) {
                return (
                  <tr key={agent.id} className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onCheckIn(agent.id, agent.site_id!)}
                          className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        >
                          Check-In Now
                        </button>
                        <button
                          onClick={() => onMarkAbsent(agent.id, agent.site_id!)}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                          Mark Absent
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                  </tr>
                );
              }
              return null;
            })}

            {/* Show recorded attendance */}
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {record.agent?.photo_url && (
                      <img
                        src={record.agent.photo_url}
                        alt={record.agent?.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {record.agent?.name || 'Unknown Agent'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.check_in ? format(new Date(record.check_in), 'pp') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.check_out ? format(new Date(record.check_out), 'pp') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.total_hours ? record.total_hours.toFixed(2) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusStyle(record.status, record.total_hours)
                  }`}>
                    {record.status.toUpperCase()}
                    {record.is_replacement && ' (Replacement)'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {record.check_in && !record.check_out && (
                    <button
                      onClick={() => onCheckOut(record.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Check-Out Now
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(record.id)}
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