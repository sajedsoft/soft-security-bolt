import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Site } from '../../types/site';
import 'leaflet/dist/leaflet.css';

export default function SitesMapPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    zone: '',
    risk_level: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sites';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = !searchTerm || site.site_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = !filters.zone || site.zone === filters.zone;
    const matchesRiskLevel = !filters.risk_level || site.risk_level === filters.risk_level;
    const matchesStatus = !filters.status || site.status === filters.status;
    return matchesSearch && matchesZone && matchesRiskLevel && matchesStatus;
  });

  const uniqueZones = Array.from(new Set(sites.map(s => s.zone).filter(Boolean)));

  const handleNavigate = (site: Site) => {
    if (site.latitude && site.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`,
        '_blank'
      );
    }
  };

  const handleShareLocation = async (site: Site) => {
    if (site.latitude && site.longitude) {
      const locationText = `${site.site_name || 'Site'} Location:\nLatitude: ${site.latitude}\nLongitude: ${site.longitude}\nGoogle Maps: https://www.google.com/maps?q=${site.latitude},${site.longitude}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${site.site_name || 'Site'} Location`,
            text: locationText,
            url: `https://www.google.com/maps?q=${site.latitude},${site.longitude}`
          });
          toast.success('Location shared successfully');
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Share failed, falling back to clipboard:', error);
            try {
              await navigator.clipboard.writeText(locationText);
              toast.success('Location coordinates copied to clipboard');
            } catch (clipboardError) {
              console.error('Clipboard fallback failed:', clipboardError);
              toast.error('Failed to share or copy location');
            }
          }
        }
      } else {
        try {
          await navigator.clipboard.writeText(locationText);
          toast.success('Location coordinates copied to clipboard');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to copy location';
          console.error(errorMessage);
          toast.error('Failed to copy location');
        }
      }
    }
  };

  const handleEmergencyLink = (site: Site) => {
    const link = `${window.location.origin}/emergency/${site.emergency_link_id}`;
    window.open(link, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  const validSites = filteredSites.filter(site => site.latitude && site.longitude);
  if (validSites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No sites with coordinates found.</p>
      </div>
    );
  }

  const bounds = validSites.map(site => [site.latitude!, site.longitude!]);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sites Map</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by site name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={filters.zone}
            onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Zones</option>
            {uniqueZones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Risk Levels</option>
            <option value="standard">Standard</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '70vh' }}>
        <MapContainer
          bounds={bounds}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution="&copy; Google Maps"
          />
          {validSites.map((site) => (
            <Marker
              key={site.id}
              position={[site.latitude!, site.longitude!]}
              icon={new Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">{site.site_name || 'Unnamed Site'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{site.company_name}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Agents:</span> {site.day_agents_count} day / {site.night_agents_count} night
                    </p>
                    <p>
                      <span className="font-medium">Activity:</span> {site.activity_type}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {site.status}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleNavigate(site)}
                      className="w-full px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Navigate
                    </button>
                    <button
                      onClick={() => handleShareLocation(site)}
                      className="w-full px-3 py-1 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200"
                    >
                      Share Location
                    </button>
                    {site.emergency_link_id && (
                      <button
                        onClick={() => handleEmergencyLink(site)}
                        className="w-full px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
                      >
                        Emergency Link
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}