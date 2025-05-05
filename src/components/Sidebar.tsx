import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  PhoneIcon,
  ArchiveBoxIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  MapIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import Logo from './Logo';

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { path: '/dashboard/sites', label: 'Sites', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
    { path: '/dashboard/sites-map', label: 'Sites Map', icon: <MapIcon className="w-5 h-5" /> },
    { path: '/dashboard/agents', label: 'Agents', icon: <UserGroupIcon className="w-5 h-5" /> },
    { path: '/dashboard/attendance', label: 'Attendance', icon: <ClockIcon className="w-5 h-5" /> },
    { path: '/dashboard/photo-attendance', label: 'Photo Attendance', icon: <CameraIcon className="w-5 h-5" /> },
    { path: '/dashboard/main-courante', label: 'Main Courante', icon: <ClipboardDocumentIcon className="w-5 h-5" /> },
    { path: '/dashboard/contacts', label: 'Contacts', icon: <PhoneIcon className="w-5 h-5" /> },
    { path: '/dashboard/stock', label: 'Stock', icon: <ArchiveBoxIcon className="w-5 h-5" /> },
    { path: '/dashboard/alerts', label: 'Alerts', icon: <BellAlertIcon className="w-5 h-5" /> },
    { path: '/dashboard/reports', label: 'Reports', icon: <DocumentChartBarIcon className="w-5 h-5" /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-full bg-security-dark-900 text-white">
      <div className="p-6 border-b border-security-dark-600">
        <Logo className="mx-auto mb-2" size="sm" />
        <h1 className="text-xl font-bold text-center text-security-primary">SOFT SECURITY</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-security-dark-700 text-security-primary border-l-4 border-security-primary'
                : 'text-gray-300 hover:bg-security-dark-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-security-dark-600">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-security-dark-700 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;