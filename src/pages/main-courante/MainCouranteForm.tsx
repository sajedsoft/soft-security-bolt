import { useState, useRef, useEffect } from 'react';
import type { IncidentReport, IncidentType, IncidentStatus } from '../../types/incident';
import type { Site } from '../../types/site';
import type { Agent } from '../../types/agent';
import { supabase } from '../../lib/supabase';

interface MainCouranteFormProps {
  onSubmit: (reportData: Partial<IncidentReport>, photo: File | null) => void;
  onCancel: () => void;
  initialData?: IncidentReport;
  sites: Site[];
}

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'internal_theft', label: 'Internal Theft' },
  { value: 'external_theft', label: 'External Theft' },
  { value: 'staff_delay', label: 'Staff Delay' },
  { value: 'fire', label: 'Fire' },
  { value: 'agent_abandoning_post', label: 'Agent Abandoning Post' },
  { value: 'sleeping_agent', label: 'Sleeping Agent' },
  { value: 'agent_bad_posture', label: 'Agent in Bad Posture' },
  { value: 'non_compliance', label: 'Non-compliance with Instructions' },
  { value: 'hygiene_problem', label: 'Hygiene Problem' },
  { value: 'communication_problem', label: 'Communication Problem' },
  { value: 'client_complaint', label: 'Client Complaint' },
  { value: 'insubordination', label: 'Insubordination' },
  { value: 'other', label: 'Other' }
];

export default function MainCouranteForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  sites 
}: MainCouranteFormProps) {
  const [formData, setFormData] = useState<Partial<IncidentReport>>(initialData || {
    incident_types: [],
    status: 'unresolved'
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.site_id) {
      fetchSiteAgents(formData.site_id);
    }
  }, [formData.site_id]);

  const fetchSiteAgents = async (siteId: string) => {
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
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, photo);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIncidentTypeChange = (type: IncidentType) => {
    setFormData(prev => {
      const types = prev.incident_types || [];
      if (types.includes(type)) {
        return {
          ...prev,
          incident_types: types.filter(t => t !== type),
          other_incident_type: type === 'other' ? undefined : prev.other_incident_type
        };
      }
      return {
        ...prev,
        incident_types: [...types, type]
      };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Site *</label>
          <select
            name="site_id"
            required
            value={formData.site_id || ''}
            onChange={handleChange}
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

        {formData.site_id && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Agent Involved</label>
            <select
              name="agent_id"
              value={formData.agent_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Type(s) *
          </label>
          <div className="grid grid-cols-2 gap-4">
            {INCIDENT_TYPES.map(type => (
              <div key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={type.value}
                  checked={formData.incident_types?.includes(type.value)}
                  onChange={() => handleIncidentTypeChange(type.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={type.value} className="ml-2 text-sm text-gray-700">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {formData.incident_types?.includes('other') && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Specify Other Incident Type *
            </label>
            <input
              type="text"
              name="other_incident_type"
              required
              value={formData.other_incident_type || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description of the Situation *
          </label>
          <textarea
            name="description"
            required
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reported By *
          </label>
          <input
            type="text"
            name="reported_by"
            required
            value={formData.reported_by || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status || 'unresolved'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="unresolved">Unresolved</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Resolution Details
          </label>
          <textarea
            name="resolution_details"
            value={formData.resolution_details || ''}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
            )}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
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
          {initialData ? 'Update' : 'Create'} Report
        </button>
      </div>
    </form>
  );
}