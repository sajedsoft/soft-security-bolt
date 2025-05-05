import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-security-dark-800">
      <div className="w-64 h-full flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;