import React, { ReactNode } from 'react';
import MobileHeader from './MobileHeader';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <MobileHeader />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;