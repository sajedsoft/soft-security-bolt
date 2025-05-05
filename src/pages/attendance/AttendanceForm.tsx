import { useState, useEffect } from 'react';
import type { AttendanceRecord, AgentWithSite } from '../../types/attendance';

interface AttendanceFormProps {
  onSubmit: (data: Partial<AttendanceRecord>) => void;
  onCancel: () => void;
  agents: AgentWithSite[];
  selectedSite?: string;
}

export default function AttendanceForm({ 
  onSubmit, 
  onCancel, 
  agents,
  selectedSite 
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    is_replacement: false,
    site_id: selectedSite
  });

  // Update site_id when selectedSite prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      site_id: selectedSite
    }));
  }, [selectedSite]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total hours if both check-in and check-out are provided
    let totalHours = null;
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in);
      const checkOut = new Date(formData.check_out);
      totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }

    onSubmit({
      ...formData,
      total_hours: totalHours
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTimeNow = (field: 'check_in' | 'check_out') => {
    setFormData(prev => ({
      ...prev,
      [field]: new Date().toISOString()
    }));
  };

  // Filter agents by selected site
  const filteredAgents = selectedSite 
    ? agents.filter(agent => agent.site_id === selectedSite)
    : agents;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Agent *</label>
          <select
            name="agent_id"
            required
            value={formData.agent_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select agent</option>
            {filteredAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name} {agent.site?.site_name ? `(${agent.site.site_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-In Time</label>
          <div className="flex space-x-2">
            <input
              type="datetime-local"
              name="check_in"
              value={formData.check_in?.slice(0, 16) || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleTimeNow('check_in')}
              className="mt-1 px-3 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Now
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-Out Time</label>
          <div className="flex space-x-2">
            <input
              type="datetime-local"
              name="check_out"
              value={formData.check_out?.slice(0, 16) || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleTimeNow('check_out')}
              className="mt-1 px-3 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Now
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status || 'present'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="24h">24h</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_replacement"
            name="is_replacement"
            checked={formData.is_replacement || false}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_replacement" className="text-sm font-medium text-gray-700">
            Is Replacement
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <textarea
            name="comments"
            value={formData.comments || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
        >
          Save Record
        </button>
      </div>
    </form>
  );
}