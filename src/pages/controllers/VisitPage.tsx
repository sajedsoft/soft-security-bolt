import React from 'react';
import { useParams } from 'react-router-dom';

const VisitPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Visit Details</h1>
      <p>Visit ID: {id}</p>
    </div>
  );
};

export default VisitPage;