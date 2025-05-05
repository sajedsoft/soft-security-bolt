import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Site } from '../../types/site';
import SiteForm from './SiteForm';
import SiteList from './SiteList';
import SiteProfile from './SiteProfile';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [viewingSite, setViewingSite] = useState<Site | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('site_name');
      
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

  const handleAddSite = async (siteData: Partial<Site>, photo: File | null) => {
    try {
      setLoading(true);
      
      let photo_url = null;
      if (photo) {
        const { data: photoData, error: photoError } = await supabase.storage
          .from('site-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('site-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('sites')
        .insert([{
          ...siteData,
          photo_url,
          emergency_link_id: crypto.randomUUID(),
          facial_checkin_enabled: false
        }])
        .select()
        .single();

      if (error) throw error;

      setSites(prevSites => [...prevSites, data]);
      setShowForm(false);
      toast.success('Site added successfully');
      
      fetchSites();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add site';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSite = async (siteData: Partial<Site>, photo: File | null) => {
    if (!selectedSite) return;

    try {
      setLoading(true);
      
      let photo_url = selectedSite.photo_url;
      if (photo) {
        if (selectedSite.photo_url) {
          const oldPhotoPath = selectedSite.photo_url.split('/').pop();
          if (oldPhotoPath) {
            await supabase.storage
              .from('site-photos')
              .remove([oldPhotoPath]);
          }
        }

        const { data: photoData, error: photoError } = await supabase.storage
          .from('site-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('site-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('sites')
        .update({
          ...siteData,
          photo_url
        })
        .eq('id', selectedSite.id)
        .select()
        .single();

      if (error) throw error;

      setSites(prevSites => 
        prevSites.map(site => site.id === selectedSite.id ? data : site)
      );
      setSelectedSite(null);
      setShowForm(false);
      toast.success('Site updated successfully');
      
      fetchSites();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update site';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      setLoading(true);
      
      const site = sites.find(s => s.id === id);
      
      if (site?.photo_url) {
        const photoPath = site.photo_url.split('/').pop();
        if (photoPath) {
          await supabase.storage
            .from('site-photos')
            .remove([photoPath]);
        }
      }

      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSites(prevSites => prevSites.filter(site => site.id !== id));
      toast.success('Site deleted successfully');
      
      fetchSites();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete site';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sites.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !sites.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sites Management</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setSelectedSite(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Site
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <SiteForm
            onSubmit={selectedSite ? handleEditSite : handleAddSite}
            onCancel={() => {
              setShowForm(false);
              setSelectedSite(null);
            }}
            initialData={selectedSite || undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <SiteList
            sites={sites}
            onEdit={(site) => {
              setSelectedSite(site);
              setShowForm(true);
            }}
            onDelete={handleDeleteSite}
            onView={(site) => setViewingSite(site)}
          />
        </div>
      )}

      {viewingSite && (
        <SiteProfile
          site={viewingSite}
          onClose={() => setViewingSite(null)}
        />
      )}
    </div>
  );
}