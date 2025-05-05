import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';
import type { EmergencyAlert } from '../../types/emergency';

const ALERT_SOUND = new Audio('/alert.mp3');

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alertsSubscription = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    verifyConnectionAndFetchAlerts();
    return () => {
      if (alertsSubscription.current) {
        supabase.removeChannel(alertsSubscription.current);
      }
    };
  }, []);

  const verifyConnectionAndFetchAlerts = async () => {
    try {
      // First verify Supabase connection
      const connectionStatus = await checkSupabaseConnection();
      if (!connectionStatus.success) {
        throw new Error(`Connection to Supabase failed: ${connectionStatus.error}`);
      }

      await fetchAlerts();
      subscribeToAlerts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize alerts system';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select(`
          *,
          site:sites (
            site_name,
            contact_name
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch alerts';
      throw new Error(`Error fetching alerts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    alertsSubscription.current = supabase
      .channel('emergency_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_alerts'
        },
        async (payload) => {
          try {
            // Play sound for danger alerts
            if (payload.new.type === 'danger') {
              ALERT_SOUND.play().catch(console.error);
            }

            // Fetch full alert data including site info
            const { data, error } = await supabase
              .from('emergency_alerts')
              .select(`
                *,
                site:sites (
                  site_name,
                  contact_name
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) throw error;
            if (data) {
              setAlerts(prev => [data, ...prev]);
            }
          } catch (error) {
            console.error('Error processing new alert:', error);
          }
        }
      )
      .subscribe();
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true }
            : alert
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to acknowledge alert';
      console.error('Error acknowledging alert:', errorMessage);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <p className="mt-2 text-sm">
          Please check your internet connection and ensure you are logged in. If the problem persists, contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Emergency Alerts</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`${
                    alert.type === 'danger' && !alert.acknowledged
                      ? 'bg-red-50 animate-pulse'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(alert.timestamp), 'PPpp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {alert.site?.site_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {alert.site?.contact_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      alert.type === 'danger'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.type === 'danger' ? 'DANGER' : 'Contact Request'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.latitude && alert.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View on Map
                      </a>
                    ) : (
                      'No location data'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}