import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  BellAlertIcon,
  TruckIcon,
  DocumentTextIcon,
  MapIcon,
  ArchiveBoxIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalSites: 0,
    todayAttendance: 0,
    openAlerts: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active agents count
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('count')
        .eq('status', 'active')
        .single();

      if (agentsError) throw agentsError;

      // Fetch total sites count
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('count')
        .eq('status', 'active')
        .single();

      if (sitesError) throw sitesError;

      // Fetch today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('count')
        .eq('date', today)
        .eq('status', 'present')
        .single();

      if (attendanceError) throw attendanceError;

      // Fetch open alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('emergency_alerts')
        .select('count')
        .eq('acknowledged', false)
        .single();

      if (alertsError) throw alertsError;

      setStats({
        activeAgents: agents?.count || 0,
        totalSites: sites?.count || 0,
        todayAttendance: attendance?.count || 0,
        openAlerts: alerts?.count || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // Sample data for charts
  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [85, 10, 5],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderWidth: 0
    }]
  };

  const alertsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Alerts',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#EF4444',
      tension: 0.4
    }]
  };

  const quickActions = [
    { name: "Agents", icon: UserGroupIcon, path: "/agents", color: "bg-emerald-500" },
    { name: "Sites", icon: BuildingOfficeIcon, path: "/sites", color: "bg-blue-500" },
    { name: "Attendance", icon: ClockIcon, path: "/attendance", color: "bg-violet-500" },
    { name: "Alerts", icon: BellAlertIcon, path: "/alerts", color: "bg-red-500" },
    { name: "Vehicles", icon: TruckIcon, path: "/vehicles", color: "bg-amber-500" },
    { name: "Reports", icon: DocumentTextIcon, path: "/reports", color: "bg-indigo-500" },
    { name: "Map", icon: MapIcon, path: "/sites-map", color: "bg-cyan-500" },
    { name: "Stock", icon: ArchiveBoxIcon, path: "/stock", color: "bg-teal-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Agents</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAgents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sites</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-violet-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayAttendance}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <BellAlertIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Open Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.openAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
              <div className="h-64">
                <Doughnut data={attendanceData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Alert Trends</h2>
              <div className="h-64">
                <Line data={alertsData} options={{ maintainAspectRatio: false }} />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
            >
              <div className={`${action.color} p-3 rounded-full mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}