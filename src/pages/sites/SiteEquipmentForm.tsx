import { useState } from 'react';
import type { SiteEquipment, CommunicationDevice, SimProvider } from '../../types/site';

interface SiteEquipmentFormProps {
  onSubmit: (equipment: Partial<SiteEquipment>, devices: Partial<CommunicationDevice>[]) => void;
  onCancel: () => void;
  initialEquipment?: SiteEquipment;
  initialDevices?: CommunicationDevice[];
}

export default function SiteEquipmentForm({ 
  onSubmit, 
  onCancel, 
  initialEquipment,
  initialDevices = []
}: SiteEquipmentFormProps) {
  const [equipment, setEquipment] = useState<Partial<SiteEquipment>>(initialEquipment || {
    has_qr_codes: false,
    qr_codes_count: 0
  });

  const [devices, setDevices] = useState<Partial<CommunicationDevice>[]>(
    initialDevices.length > 0 ? initialDevices : [{ type: 'talkie' }]
  );

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEquipment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeviceChange = (index: number, field: keyof CommunicationDevice, value: string) => {
    setDevices(prev => {
      const newDevices = [...prev];
      newDevices[index] = { ...newDevices[index], [field]: value };
      return newDevices;
    });
  };

  const addDevice = (type: 'talkie' | 'phone') => {
    setDevices(prev => [...prev, { type }]);
  };

  const removeDevice = (index: number) => {
    setDevices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(equipment, devices);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">QR Codes</h3>
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="has_qr_codes"
            name="has_qr_codes"
            checked={equipment.has_qr_codes}
            onChange={handleEquipmentChange}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="has_qr_codes" className="text-sm font-medium text-gray-700">
            Site has QR codes installed
          </label>
        </div>

        {equipment.has_qr_codes && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of QR Codes</label>
            <input
              type="number"
              name="qr_codes_count"
              value={equipment.qr_codes_count}
              onChange={handleEquipmentChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Communication Devices</h3>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => addDevice('talkie')}
              className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Add Talkie
            </button>
            <button
              type="button"
              onClick={() => addDevice('phone')}
              className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Add Phone
            </button>
          </div>
        </div>

        {devices.map((device, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">
                {device.type === 'talkie' ? 'Talkie Walkie' : 'Phone'} #{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeDevice(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={device.brand || ''}
                  onChange={(e) => handleDeviceChange(index, 'brand', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IMEI</label>
                <input
                  type="text"
                  value={device.imei || ''}
                  onChange={(e) => handleDeviceChange(index, 'imei', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={device.phone_number || ''}
                  onChange={(e) => handleDeviceChange(index, 'phone_number', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SIM IMEI</label>
                <input
                  type="text"
                  value={device.sim_imei || ''}
                  onChange={(e) => handleDeviceChange(index, 'sim_imei', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SIM Provider</label>
                <select
                  value={device.sim_provider || ''}
                  onChange={(e) => handleDeviceChange(index, 'sim_provider', e.target.value as SimProvider)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select provider</option>
                  <option value="mtn">MTN</option>
                  <option value="orange">Orange</option>
                  <option value="moov">Moov</option>
                </select>
              </div>
            </div>
          </div>
        ))}
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
          Save Equipment
        </button>
      </div>
    </form>
  );
}