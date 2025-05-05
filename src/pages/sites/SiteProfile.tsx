import { useRef } from 'react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Site, SiteEquipment, CommunicationDevice, SiteHistory } from '../../types/site';

interface SiteProfileProps {
  site: Site;
  equipment?: SiteEquipment;
  devices?: CommunicationDevice[];
  history?: SiteHistory[];
  onClose: () => void;
}

export default function SiteProfile({ 
  site, 
  equipment, 
  devices = [], 
  history = [], 
  onClose 
}: SiteProfileProps) {
  const profileRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (profileRef.current) {
      const canvas = await html2canvas(profileRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${site.site_name || 'site'}-profile.pdf`);
    }
  };

  const copyEmergencyLink = () => {
    const link = `${window.location.origin}/emergency/${site.emergency_link_id}`;
    navigator.clipboard.writeText(link);
    alert('Emergency link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div ref={profileRef} className="p-6">
          {/* Existing profile content */}
          
          <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Emergency Access</h3>
            <p className="text-sm text-red-600 mb-4">
              Share this emergency link with the client for quick access to emergency services.
              The link is unique to this site and should be kept secure.
            </p>
            <div className="flex items-center space-x-4">
              <code className="px-3 py-2 bg-white rounded border text-sm flex-1">
                {`${window.location.origin}/emergency/${site.emergency_link_id}`}
              </code>
              <button
                onClick={copyEmergencyLink}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Copy Emergency Link
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Export to PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}