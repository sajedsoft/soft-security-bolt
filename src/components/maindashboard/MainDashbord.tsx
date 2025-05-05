import { useNavigate } from "react-router-dom";
import { 
  UserGroupIcon, 
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  BellAlertIcon,
  MapIcon,
  TruckIcon,
  ArchiveBoxIcon,
  PhoneIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const MainDashboard = () => {
  const navigate = useNavigate();

  // Sample data for charts
  const agentData = {
    labels: ['Active', 'On Leave', 'Inactive'],
    datasets: [{
      data: [65, 20, 15],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  const siteData = {
    labels: ['Active Sites', 'Maintenance', 'Inactive'],
    datasets: [{
      data: [80, 10, 10],
      backgroundColor: ['#3B82F6', '#8B5CF6', '#6B7280'],
      borderWidth: 0
    }]
  };

  const quickStats = [
    { label: "Total Agents", value: "247", color: "bg-emerald-100 text-emerald-800" },
    { label: "Active Sites", value: "42", color: "bg-blue-100 text-blue-800" },
    { label: "Today's Attendance", value: "92%", color: "bg-violet-100 text-violet-800" },
    { label: "Open Alerts", value: "3", color: "bg-red-100 text-red-800" }
  ];

  const modules = [
    { name: "Agents", icon: UserGroupIcon, path: "/agents", color: "bg-emerald-500" },
    { name: "Sites", icon: BuildingOfficeIcon, path: "/sites", color: "bg-blue-500" },
    { name: "Attendance", icon: ClockIcon, path: "/attendance", color: "bg-violet-500" },
    { name: "Main Courante", icon: DocumentTextIcon, path: "/main-courante", color: "bg-amber-500" },
    { name: "Alerts", icon: BellAlertIcon, path: "/alerts", color: "bg-red-500" },
    { name: "Map", icon: MapIcon, path: "/sites-map", color: "bg-indigo-500" },
    { name: "Vehicles", icon: TruckIcon, path: "/vehicles", color: "bg-cyan-500" },
    { name: "Stock", icon: ArchiveBoxIcon, path: "/stock", color: "bg-teal-500" },
    { name: "Contacts", icon: PhoneIcon, path: "/contacts", color: "bg-pink-500" },
    { name: "Settings", icon: Cog6ToothIcon, path: "/settings", color: "bg-gray-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full`}>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Agent Distribution</h2>
              <div className="h-64">
                <Doughnut data={agentData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Site Status</h2>
              <div className="h-64">
                <Doughnut data={siteData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <BellAlertIcon className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Emergency Alert</p>
                  <p className="text-xs text-red-700">Site A - 5 mins ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                <BellAlertIcon className="h-5 w-5 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Agent Missing</p>
                  <p className="text-xs text-amber-700">Site B - 15 mins ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <BellAlertIcon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Equipment Issue</p>
                  <p className="text-xs text-blue-700">Site C - 30 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {modules.map((module, index) => (
            <button
              key={index}
              onClick={() => navigate(module.path)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
            >
              <div className={`${module.color} p-3 rounded-full mb-3`}>
                <module.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{module.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;