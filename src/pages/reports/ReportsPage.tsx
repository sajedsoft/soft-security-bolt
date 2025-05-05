import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import { supabase } from '../../lib/supabase';
import AttendanceReportSection from './sections/AttendanceReportSection';
import IncidentReportSection from './sections/IncidentReportSection';
import PresenceSummarySection from './sections/PresenceSummarySection';

type ActiveSection = 'attendance' | 'incidents' | 'presence';

export default function ReportsPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('attendance');

  const renderSection = () => {
    switch (activeSection) {
      case 'attendance':
        return <AttendanceReportSection />;
      case 'incidents':
        return <IncidentReportSection />;
      case 'presence':
        return <PresenceSummarySection />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveSection('attendance')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'attendance'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance Report
            </button>
            <button
              onClick={() => setActiveSection('incidents')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'incidents'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incident Report
            </button>
            <button
              onClick={() => setActiveSection('presence')}
              className={`py-4 px-6 text-sm font-medium ${
                activeSection === 'presence'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Presence Summary
            </button>
          </nav>
        </div>

        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}