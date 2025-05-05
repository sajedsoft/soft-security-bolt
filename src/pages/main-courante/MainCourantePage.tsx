import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { supabase } from '../../lib/supabase';
import type { IncidentReport } from '../../types/incident';
import type { Site } from '../../types/site';
import MainCouranteForm from './MainCouranteForm';
import MainCouranteList from './MainCouranteList';

export default function MainCourantePage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  useEffect(() => {
    fetchReports();
    fetchSites();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incident_reports')
        .select(`
          *,
          site:sites (
            site_name
          ),
          agent:agents (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, site_name')
        .order('site_name');
      
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    }
  };

  const handleAddReport = async (reportData: Partial<IncidentReport>, photo: File | null) => {
    try {
      setLoading(true);
      
      let photo_url = null;
      if (photo) {
        const { data: photoData, error: photoError } = await supabase.storage
          .from('incident-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('incident-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('incident_reports')
        .insert([{
          ...reportData,
          photo_url
        }])
        .select(`
          *,
          site:sites (
            site_name
          ),
          agent:agents (
            name
          )
        `)
        .single();

      if (error) throw error;

      setReports([data, ...reports]);
      setShowForm(false);
      toast.success('Report added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = async (reportData: Partial<IncidentReport>, photo: File | null) => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      
      let photo_url = selectedReport.photo_url;
      if (photo) {
        if (selectedReport.photo_url) {
          const oldPhotoPath = selectedReport.photo_url.split('/').pop();
          if (oldPhotoPath) {
            await supabase.storage
              .from('incident-photos')
              .remove([oldPhotoPath]);
          }
        }

        const { data: photoData, error: photoError } = await supabase.storage
          .from('incident-photos')
          .upload(`${Date.now()}-${photo.name}`, photo);
        
        if (photoError) throw photoError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('incident-photos')
          .getPublicUrl(photoData.path);
          
        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('incident_reports')
        .update({
          ...reportData,
          photo_url
        })
        .eq('id', selectedReport.id)
        .select(`
          *,
          site:sites (
            site_name
          ),
          agent:agents (
            name
          )
        `)
        .single();

      if (error) throw error;

      setReports(reports.map(report => 
        report.id === selectedReport.id ? data : report
      ));
      setSelectedReport(null);
      setShowForm(false);
      toast.success('Report updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      setLoading(true);
      
      const report = reports.find(r => r.id === id);
      
      if (report?.photo_url) {
        const photoPath = report.photo_url.split('/').pop();
        if (photoPath) {
          await supabase.storage
            .from('incident-photos')
            .remove([photoPath]);
        }
      }

      const { error } = await supabase
        .from('incident_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports(reports.filter(report => report.id !== id));
      toast.success('Report deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Incident Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPp')}`, 20, 30);
    
    // Add content
    doc.setFontSize(10);
    let y = 40;
    
    reports.forEach((report, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      // Header with date and site
      doc.setFont(undefined, 'bold');
      doc.text(`Date: ${format(new Date(report.created_at), 'PPp')}`, 20, y);
      y += 7;
      doc.text(`Site: ${report.site?.site_name || 'Unknown Site'}`, 20, y);
      y += 10;

      // Incident Types
      doc.text('Incident Type(s):', 20, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      report.incident_types.forEach(type => {
        const displayType = type.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        doc.text(`• ${displayType}`, 25, y);
        y += 5;
      });
      if (report.other_incident_type) {
        doc.text(`• Other: ${report.other_incident_type}`, 25, y);
        y += 5;
      }
      y += 5;

      // Description
      doc.setFont(undefined, 'bold');
      doc.text('Description:', 20, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      const descriptionLines = doc.splitTextToSize(report.description, 170);
      doc.text(descriptionLines, 20, y);
      y += (descriptionLines.length * 5) + 5;

      // Reported By
      doc.setFont(undefined, 'bold');
      doc.text('Reported By:', 20, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      doc.text(report.reported_by || 'Unknown', 20, y);
      y += 10;

      // Status and Resolution
      doc.setFont(undefined, 'bold');
      doc.text('Status:', 20, y);
      doc.setFont(undefined, 'normal');
      const status = report.status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      doc.text(status, 50, y);
      y += 7;

      if (report.resolution_details) {
        doc.setFont(undefined, 'bold');
        doc.text('Resolution Details:', 20, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        const resolutionLines = doc.splitTextToSize(report.resolution_details, 170);
        doc.text(resolutionLines, 20, y);
        y += (resolutionLines.length * 5) + 5;
      }

      // Photo information
      if (report.photo_url) {
        doc.setFont(undefined, 'bold');
        doc.text('Photo:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text('Available in system', 50, y);
        y += 7;
      }

      // Add separator between reports
      if (index < reports.length - 1) {
        y += 5;
        doc.setDrawColor(200);
        doc.line(20, y, 190, y);
        y += 10;
      }
    });
    
    doc.save(`incident-reports-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading && !reports.length) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !reports.length) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Main Courante</h1>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Export to PDF
          </button>
          <button
            onClick={() => {
              setSelectedReport(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Entry
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <MainCouranteForm
            onSubmit={selectedReport ? handleEditReport : handleAddReport}
            onCancel={() => {
              setShowForm(false);
              setSelectedReport(null);
            }}
            initialData={selectedReport || undefined}
            sites={sites}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <MainCouranteList
            reports={reports}
            onEdit={(report) => {
              setSelectedReport(report);
              setShowForm(true);
            }}
            onDelete={handleDeleteReport}
          />
        </div>
      )}
    </div>
  );
}