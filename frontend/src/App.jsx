import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Common Components
import { DemoRoleBar } from './components/common/DemoRoleBar';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { GuardDashboard } from './pages/GuardDashboard';
import { CommunityAdminDashboard } from './pages/CommunityAdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';

import { VisitorsPage } from './pages/VisitorsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { NoticesPage } from './pages/NoticesPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { EventsPage } from './pages/EventsPage';
import { VillaDirectoryPage } from './pages/VillaDirectoryPage';
import { ResidentDirectoryPage } from './pages/ResidentDirectoryPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading CommunityHub...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Role-Aware Main Dashboard Router
const MainDashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'COMMUNITY_ADMIN':
      return <CommunityAdminDashboard />;
    case 'SECURITY_GUARD':
      return <GuardDashboard />;
    case 'RESIDENT':
    default:
      return <ResidentDashboard />;
  }
};

// Main App Layout Structure
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      <DemoRoleBar />
      <EmergencyBanner />
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<MainDashboardRouter />} />
            <Route path="/security" element={<GuardDashboard />} />
            <Route path="/guard" element={<GuardDashboard />} />
            <Route path="/gate-security" element={<GuardDashboard />} />
            <Route path="/residents-directory" element={<ResidentDirectoryPage />} />
            <Route path="/visitors" element={<VisitorsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/villas" element={<VillaDirectoryPage />} />
            <Route path="/vehicles" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
