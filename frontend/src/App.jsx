import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ProposalsPage } from './pages/ProposalsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { ListingsPage } from './pages/ListingsPage';

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
    case 'COMMUNITY_ADMIN':
      // Both admin roles see the same full community dashboard.
      // SUPER_ADMIN gets 'Communities' in the sidebar for multi-community mgmt.
      return <CommunityAdminDashboard />;
    case 'SECURITY_GUARD':
      return <GuardDashboard />;
    case 'RESIDENT':
    default:
      return <ResidentDashboard />;
  }
};

/* ── Scroll to top on every route change ── */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Also scroll the inner page content container (it has overflow-y: auto)
    const content = document.querySelector('.ch-page-content');
    if (content) content.scrollTop = 0;
  }, [pathname]);
  return null;
};

// Main App Layout Structure
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ch-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="ch-main-area">
        <DemoRoleBar />
        <EmergencyBanner />
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="ch-page-content">
          <Routes>
            <Route path="/" element={<MainDashboardRouter />} />
            <Route path="/communities" element={<SuperAdminDashboard />} />
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
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/audit-trail" element={<AuditTrailPage />} />
            <Route path="/listings" element={<ListingsPage />} />
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
            <ScrollToTop />
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
