import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Agent, JobTitle } from '../../types/agent';
import type { Site } from '../../types/site';
import toast from 'react-hot-toast';

interface AgentFormProps {
  onSubmit: (agent: Partial<Agent>, photo: File | null, documents: File[]) => void;
  onCancel: () => void;
  initialData?: Agent;
}

export default function AgentForm({ onSubmit, onCancel, initialData }: AgentFormProps) {
  const [formData, setFormData] = useState<Partial<Agent>>(initialData || {});
  const [photo, setPhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);
  const [sites, setSites] = useState<Pick<Site, 'id' | 'site_name'>[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSites();
  }, []);

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
      toast.error('Failed to fetch sites');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, photo, documents);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const jobTitles: JobTitle[] = [
    'APS STANDARD',
    'APS EN ARME',
    'CONDUCTEUR',
    'CONTRÔLEUR VOITURE',
    'CONTRÔLEUR MOTO',
    'OPÉRATION',
    'RESSOURCE HUMAINE',
    'CYNOPHILE',
    'PC',
    'AGENT NETTOYAGE',
    'CONFORMITÉ',
    'INFORMATICIEN',
    'COMPTABILITÉ',
    'EXPLOITATION',
    'COUTURIER',
    'SUPERVISEUR',
    'TECHNICIEN',
    'GDC'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title *</label>
          <select
            name="job_title"
            required
            value={formData.job_title || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select job title</option>
            {jobTitles.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contract Type *</label>
          <select
            name="contract_type"
            required
            value={formData.contract_type || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="cdd">CDD</option>
            <option value="cdi">CDI</option>
            <option value="intern">Intern</option>
            <option value="trial">Trial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date *</label>
          <input
            type="date"
            name="start_date"
            required
            value={formData.start_date || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contract End Date</label>
          <input
            type="date"
            name="contract_end_date"
            value={formData.contract_end_date || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status *</label>
          <select
            name="status"
            required
            value={formData.status || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="left">Left</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sex</label>
          <select
            name="sex"
            value={formData.sex || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
          <input
            type="text"
            name="place_of_birth"
            value={formData.place_of_birth || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Matricule</label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Site</label>
          <select
            name="site_id"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-full"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Documents</label>
          <input
            type="file"
            ref={documentsInputRef}
            multiple
            onChange={handleDocumentsChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {documents.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              Selected files: {documents.map(f => f.name).join(', ')}
            </div>
          )}
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
          {initialData ? 'Update' : 'Create'} Agent
        </button>
      </div>
    </form>
  );
}