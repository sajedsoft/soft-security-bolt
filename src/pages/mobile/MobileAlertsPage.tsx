import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const MobileAlertsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Alerts</h1>
      <div className="space-y-4">
        {/* Alert content will go here */}
      </div>
    </div>
  );
};

export default MobileAlertsPage;