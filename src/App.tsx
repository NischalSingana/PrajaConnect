import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
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
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PetitionBoardPage } from './pages/PetitionBoardPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MyIssuesPage } from './pages/MyIssuesPage';
import { SlaEscalationPage } from './pages/SlaEscalationPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

function DashboardIndexRedirect() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || 'citizen';
  return <Navigate to={`/dashboard/${role}`} replace />;
}

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
            <Route path="/issues" element={<PublicIssueFeed />} />
            <Route path="/issues/:id" element={<IssueDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/petitions" element={<PetitionBoardPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>

          {/* Authenticated Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndexRedirect />} />
            <Route path="citizen" element={<CitizenDashboard />} />
            <Route path="politician" element={<PoliticianDashboard />} />
            <Route path="moderator" element={<ModeratorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="issues" element={<PublicIssueFeed />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="my-issues" element={<MyIssuesPage />} />
            <Route path="escalations" element={<SlaEscalationPage />} />
            <Route path="map" element={<HeatmapPage />} />
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SmoothScroll>
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
