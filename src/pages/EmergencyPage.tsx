import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { EMERGENCY_CONTACTS } from '../types/emergency';

// Create a public client that doesn't require authentication
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false // Disable session persistence
    }
  }
);

export default function EmergencyPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [site, setSite] = useState<{ site_name: string; contact_name: string } | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .select('site_name, contact_name')
          .eq('emergency_link_id', id)
          .single();

        if (siteError) throw siteError;
        setSite(siteData);
      } catch (error) {
        setError('Site not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSite();
    }
  }, [id]);

  const handleEmergencyAction = async (type: 'danger' | 'contact') => {
    try {
      setLoading(true);

      // Get location if available
      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (locationError) {
        console.warn('Location not available:', locationError);
      }

      // Send emergency alert using Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency?` + 
        `site_id=${id}&` +
        `type=${type}` +
        (latitude ? `&lat=${latitude}` : '') +
        (longitude ? `&lng=${longitude}` : ''),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-red-600">Invalid emergency link</p>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Alert Sent Successfully
          </h1>
          <p className="text-lg text-gray-600">
            Help is on the way. Stay where you are if safe to do so.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Emergency Portal - {site.site_name}
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome {site.contact_name}
          </p>
        </div>

        <button
          onClick={() => handleEmergencyAction('danger')}
          className="w-full p-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          🚨 I AM IN DANGER
        </button>

        <button
          onClick={() => handleEmergencyAction('contact')}
          className="w-full p-4 bg-yellow-500 text-white text-lg font-bold rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300"
        >
          📞 Contact Me
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Emergency Numbers
          </h2>
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="font-medium text-gray-900">{contact.name}</span>
                <span className="text-blue-600">{contact.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}