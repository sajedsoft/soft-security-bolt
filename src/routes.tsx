import { createBrowserRouter } from "react-router-dom";
import Auth from "./auth"; // Remplace l'ancien import LoginPage
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AgentsPage from "./pages/agents/AgentsPage";
import AgentProfile from "./pages/agents/AgentProfile";
import SitesPage from "./pages/sites/SitesPage";
import SiteProfile from "./pages/sites/SiteProfile";
import SitesMapPage from "./pages/sites/SitesMapPage";
import StockPage from "./pages/stock/StockPage";
import StockDashboard from "./pages/stock/StockDashboard";
import ContactsPage from "./pages/contacts/ContactsPage";
import VehiclesPage from "./pages/vehicles/VehiclesPage";
import AttendanceList from "./pages/attendance/AttendanceList";
import PhotoAttendancePage from "./pages/attendance/PhotoAttendancePage";
import FacialCheckInPage from "./pages/attendance/FacialCheckInPage";
import ManualAttendancePage from "./pages/attendance/ManualAttendancePage";
import MainCourantePage from "./pages/main-courante/MainCourantePage";
import ReportsPage from "./pages/reports/ReportsPage";
import AlertsPage from "./pages/alerts/AlertsPage";
import EmergencyPage from "./pages/EmergencyPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ControllersPage from "./pages/controllers/ControllersPage";
import AssignmentsPage from "./pages/controllers/AssignmentsPage";
import VisitPage from "./pages/controllers/VisitPage";
import LiveMonitoringPage from "./pages/controllers/LiveMonitoringPage";

// Mobile routes
import MobileLayout from "./components/mobile/MobileLayout";
import MobileHomePage from "./pages/mobile/MobileHomePage";
import MobileVisitPage from "./pages/mobile/MobileVisitPage";
import MobileMapPage from "./pages/mobile/MobileMapPage";
import MobileAlertsPage from "./pages/mobile/MobileAlertsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Auth />, // Page de connexion moderne et sécurisée
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/agents",
        element: <AgentsPage />,
      },
      {
        path: "/agents/:id",
        element: <AgentProfile />,
      },
      {
        path: "/sites",
        element: <SitesPage />,
      },
      {
        path: "/sites/:id",
        element: <SiteProfile />,
      },
      {
        path: "/sites-map",
        element: <SitesMapPage />,
      },
      {
        path: "/stock",
        element: <StockPage />,
      },
      {
        path: "/stock/dashboard",
        element: <StockDashboard />,
      },
      {
        path: "/contacts",
        element: <ContactsPage />,
      },
      {
        path: "/vehicles",
        element: <VehiclesPage />,
      },
      {
        path: "/attendance",
        element: <AttendanceList />,
      },
      {
        path: "/attendance/photo",
        element: <PhotoAttendancePage />,
      },
      {
        path: "/attendance/facial",
        element: <FacialCheckInPage />,
      },
      {
        path: "/attendance/manual",
        element: <ManualAttendancePage />,
      },
      {
        path: "/main-courante",
        element: <MainCourantePage />,
      },
      {
        path: "/reports",
        element: <ReportsPage />,
      },
      {
        path: "/alerts",
        element: <AlertsPage />,
      },
      {
        path: "/emergency",
        element: <EmergencyPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/controllers",
        element: <ControllersPage />,
      },
      {
        path: "/assignments",
        element: <AssignmentsPage />,
      },
      {
        path: "/visits/:id",
        element: <VisitPage />,
      },
      {
        path: "/live-monitoring",
        element: <LiveMonitoringPage />,
      },
    ],
  },
  {
    path: "/m",
    element: <MobileLayout />,
    children: [
      {
        path: "",
        element: <MobileHomePage />,
      },
      {
        path: "visit/:id",
        element: <MobileVisitPage />,
      },
      {
        path: "map",
        element: <MobileMapPage />,
      },
      {
        path: "alerts",
        element: <MobileAlertsPage />,
      },
    ],
  },
]);

export default router;