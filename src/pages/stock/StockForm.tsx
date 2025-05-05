import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { StockArticle, StockSupplier, StockVariant } from '../../types/stock';

interface StockFormProps {
  onSubmit: (articleData: Partial<StockArticle>, photo: File | null) => void;
  onCancel: () => void;
  initialData?: StockArticle;
}

export default function StockForm({ onSubmit, onCancel, initialData }: StockFormProps) {
  const [formData, setFormData] = useState<Partial<StockArticle>>(initialData || {});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null);
  const [suppliers, setSuppliers] = useState<StockSupplier[]>([]);
  const [variants, setVariants] = useState<Partial<StockVariant>[]>(
    initialData?.variants || [{ size: '', color: '', quantity: 0 }]
  );
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, photo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleVariantChange = (index: number, field: keyof StockVariant, value: string | number) => {
    setVariants(prev => {
      const newVariants = [...prev];
      newVariants[index] = { 
        ...newVariants[index], 
        [field]: field === 'quantity' ? Number(value) : value 
      };
      return newVariants;
    });
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', quantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Reference Name *</label>
          <input
            type="text"
            name="reference_name"
            required
            value={formData.reference_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category"
            required
            value={formData.category || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select category</option>
            <option value="uniform">Uniform</option>
            <option value="equipment">Equipment</option>
            <option value="safety">Safety</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Quantity *</label>
          <input
            type="number"
            name="total_quantity"
            required
            min="0"
            value={formData.total_quantity || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Critical Threshold</label>
          <input
            type="number"
            name="critical_threshold"
            min="0"
            value={formData.critical_threshold || 5}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Price</label>
          <input
            type="number"
            name="unit_price"
            step="0.01"
            min="0"
            value={formData.unit_price || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier</label>
          <select
            name="supplier_id"
            value={formData.supplier_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select supplier</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
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

        <div className="col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Variants</h3>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Add Variant
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Size"
                  value={variant.size || ''}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={variant.color || ''}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  min="0"
                  value={variant.quantity || 0}
                  onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
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
          {initialData ? 'Update' : 'Create'} Article
        </button>
      </div>
    </form>
  );
}