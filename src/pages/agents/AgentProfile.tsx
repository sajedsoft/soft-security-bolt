import { useRef } from 'react';
import type { Agent } from '../../types/agent';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AgentProfileProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentProfile({ agent, onClose }: AgentProfileProps) {
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
      pdf.save(`${agent.name}-profile.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div ref={profileRef} className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
            {agent.photo_url && (
              <img
                src={agent.photo_url}
                alt={agent.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{agent.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sex</dt>
                  <dd className="text-sm text-gray-900">
                    {agent.sex ? agent.sex.charAt(0).toUpperCase() + agent.sex.slice(1) : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">
                    {agent.date_of_birth ? format(new Date(agent.date_of_birth), 'PP') : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Place of Birth</dt>
                  <dd className="text-sm text-gray-900">{agent.place_of_birth || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Matricule</dt>
                  <dd className="text-sm text-gray-900">{agent.matricule || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                  <dd className="text-sm text-gray-900">{agent.job_title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
                  <dd className="text-sm text-gray-900">{agent.contract_type.toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="text-sm text-gray-900">{format(new Date(agent.start_date), 'PP')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contract End Date</dt>
                  <dd className="text-sm text-gray-900">
                    {agent.contract_end_date ? format(new Date(agent.contract_end_date), 'PP') : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Site</dt>
                  <dd className="text-sm text-gray-900">{agent.site_id || 'Not assigned'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {agent.documents && agent.documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Documents</h3>
              <ul className="space-y-2">
                {agent.documents.map((doc, index) => (
                  <li key={index}>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Document {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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