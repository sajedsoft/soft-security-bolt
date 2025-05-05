import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Vehicle, VehicleDocument } from '../../types/vehicle';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchDocuments();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('code');
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vehicles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('*')
        .order('expiry_date');
      
      if (error) throw error;
      
      // Check for expiring documents
      const today = new Date();
      data?.forEach(doc => {
        const daysUntilExpiry = differenceInDays(new Date(doc.expiry_date), today);
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          toast.warning(`Document ${doc.document_type} expires in ${daysUntilExpiry} days`);
        }
      });

      setDocuments(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      console.error(errorMessage);
    }
  };

  if (loading && !vehicles.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !vehicles.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Vehicle list implementation will go here */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Vehicle management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}