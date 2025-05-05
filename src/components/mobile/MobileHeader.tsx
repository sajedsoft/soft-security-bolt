import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showBackButton = true }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  );
};

export default MobileHeader;