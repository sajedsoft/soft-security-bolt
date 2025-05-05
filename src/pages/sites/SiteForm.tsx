import { useState, useRef, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Site, RiskLevel, SiteStatus } from '../../types/site';
import { ABIDJAN_ZONES, INTERIOR_CITIES } from '../../types/site';

interface SiteFormProps {
  onSubmit: (siteData: Partial<Site>, photo: File | null) => void;
  onCancel: () => void;
  initialData?: Site;
}

export default function SiteForm({ onSubmit, onCancel, initialData }: SiteFormProps) {
  const [formData, setFormData] = useState<Partial<Site>>(initialData || {
    talkies_count: 0,
    phones_count: 0,
    qr_codes_count: 0
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);
  const [groupSites, setGroupSites] = useState<Site[]>([]);
  const [selectedMainZone, setSelectedMainZone] = useState<string>('');
  const [selectedSubZone, setSelectedSubZone] = useState<string>('');
  const [zoneType, setZoneType] = useState<'abidjan' | 'interior'>('abidjan');
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.group_id) {
      fetchGroupSites(formData.group_id);
    }
  }, [formData.group_id]);

  const fetchGroupSites = async (groupId: string) => {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('group_id', groupId)
      .neq('id', initialData?.id || '');
    
    setGroupSites(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contract_end_date) {
      const daysUntilEnd = differenceInDays(
        new Date(formData.contract_end_date),
        new Date()
      );
      if (daysUntilEnd <= 30 && daysUntilEnd > 0) {
        alert(`Warning: Contract will expire in ${daysUntilEnd} days`);
      }
    }

    let zone = null;
    if (zoneType === 'abidjan') {
      zone = selectedSubZone || selectedMainZone;
    } else {
      zone = selectedMainZone;
    }
    
    onSubmit({ ...formData, zone }, photo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
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

  const handleZoneTypeChange = (type: 'abidjan' | 'interior') => {
    setZoneType(type);
    setSelectedMainZone('');
    setSelectedSubZone('');
  };

  const handleMainZoneChange = (zone: string) => {
    setSelectedMainZone(zone);
    setSelectedSubZone('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Site Name</label>
          <input
            type="text"
            name="site_name"
            value={formData.site_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleZoneTypeChange('abidjan')}
                className={`px-4 py-2 rounded-md ${
                  zoneType === 'abidjan' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Abidjan
              </button>
              <button
                type="button"
                onClick={() => handleZoneTypeChange('interior')}
                className={`px-4 py-2 rounded-md ${
                  zoneType === 'interior' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Interior
              </button>
            </div>

            {zoneType === 'abidjan' ? (
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedMainZone}
                  onChange={(e) => handleMainZoneChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Commune</option>
                  {Object.keys(ABIDJAN_ZONES).map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>

                {selectedMainZone && ABIDJAN_ZONES[selectedMainZone] && (
                  <select
                    value={selectedSubZone}
                    onChange={(e) => setSelectedSubZone(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Area</option>
                    {ABIDJAN_ZONES[selectedMainZone].map(subZone => (
                      <option key={subZone} value={subZone}>{subZone}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <select
                value={selectedMainZone}
                onChange={(e) => handleMainZoneChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select City</option>
                {INTERIOR_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Landmark 1</label>
          <input
            type="text"
            name="landmark1"
            value={formData.landmark1 || ''}
            onChange={handleChange}
            placeholder="e.g., Pharmacie Saint Antoine"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Landmark 2</label>
          <input
            type="text"
            name="landmark2"
            value={formData.landmark2 || ''}
            onChange={handleChange}
            placeholder="e.g., Magasin Solange"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Landmark 3</label>
          <input
            type="text"
            name="landmark3"
            value={formData.landmark3 || ''}
            onChange={handleChange}
            placeholder="e.g., Marché public"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Type</label>
          <select
            name="activity_type"
            value={formData.activity_type || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="industrial">Industrial</option>
            <option value="construction">Construction</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Risk Level</label>
          <select
            name="risk_level"
            value={formData.risk_level || 'standard'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="standard">Standard</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status || 'active'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contract Start Date</label>
          <input
            type="date"
            name="contract_start_date"
            value={formData.contract_start_date || ''}
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
          <label className="block text-sm font-medium text-gray-700">Day Agents Count</label>
          <input
            type="number"
            name="day_agents_count"
            value={formData.day_agents_count || 0}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Night Agents Count</label>
          <input
            type="number"
            name="night_agents_count"
            value={formData.night_agents_count || 0}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Name</label>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Intermediary Name</label>
          <input
            type="text"
            name="intermediary_name"
            value={formData.intermediary_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Intermediary Phone</label>
          <input
            type="tel"
            name="intermediary_phone"
            value={formData.intermediary_phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            name="group_name"
            value={formData.group_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            name="latitude"
            value={formData.latitude || ''}
            onChange={handleChange}
            step="any"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            name="longitude"
            value={formData.longitude || ''}
            onChange={handleChange}
            step="any"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Talkie-walkies Provided</label>
          <input
            type="number"
            name="talkies_count"
            min="0"
            value={formData.talkies_count || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phones Provided</label>
          <input
            type="number"
            name="phones_count"
            min="0"
            value={formData.phones_count || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">QR Codes Installed</label>
          <input
            type="number"
            name="qr_codes_count"
            min="0"
            value={formData.qr_codes_count || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Emergency Link</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              readOnly
              value={formData.emergency_link_id ? `${window.location.origin}/emergency/${formData.emergency_link_id}` : 'Generated after saving'}
              className="flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50"
            />
            {formData.emergency_link_id && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/emergency/${formData.emergency_link_id}`);
                  toast.success('Emergency link copied to clipboard');
                }}
                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="has_team_leader"
              checked={formData.has_team_leader || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Has Team Leader</label>
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              name="has_guard_dog"
              checked={formData.has_guard_dog || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Has Guard Dog</label>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions || ''}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Site Photo</label>
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

        {groupSites.length > 0 && (
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Other Sites in this Group</h3>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {groupSites.map(site => (
                <li key={site.id} className="p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {site.site_name}
                  </div>
                  <div className="text-sm text-gray-500">{site.company_name}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
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
          {initialData ? 'Update' : 'Create'} Site
        </button>
      </div>
    </form>
  );
}