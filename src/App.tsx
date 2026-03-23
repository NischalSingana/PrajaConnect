import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SmoothScroll } from './components/layout/SmoothScroll';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicIssueFeed } from './pages/PublicIssueFeed';
import { AboutPage } from './pages/AboutPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { PoliticianDashboard } from './pages/PoliticianDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { IssueDetailPage } from './pages/IssueDetailPage';

function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
        <SmoothScroll>
          <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/*" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Authenticated Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="citizen" element={<CitizenDashboard />} />
            <Route path="politician" element={<PoliticianDashboard />} />
            <Route path="moderator" element={<ModeratorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            
            {/* The Public feed is accessible from inside the dashboard layout for logged-in users */}
            <Route path="/dashboard/issues" element={<PublicIssueFeed />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Standalone Public Issue Feed Route (for non-logged in users) */}
          <Route element={<MainLayout />}>
            <Route path="/issues" element={<div className="p-4 sm:p-8"><PublicIssueFeed /></div>} />
            <Route path="/issues/:id" element={<IssueDetailPage />} />
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SmoothScroll>
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
