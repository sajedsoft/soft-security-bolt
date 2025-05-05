import React from 'react';
import { useParams } from 'react-router-dom';
import MobileLayout from '../../components/mobile/MobileLayout';

const MobileVisitPage: React.FC = () => {
  const { id } = useParams();

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Visit Details</h1>
        <div className="bg-white rounded-lg shadow p-4">
          <p>Visit ID: {id}</p>
          {/* Add more visit details here */}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileVisitPage;