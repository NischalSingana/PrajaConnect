import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Activity } from 'lucide-react';

// Layouts (kept eager — always needed)
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SmoothScroll } from './components/layout/SmoothScroll';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const PublicIssueFeed = lazy(() => import('./pages/PublicIssueFeed').then(m => ({ default: m.PublicIssueFeed })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard').then(m => ({ default: m.CitizenDashboard })));
const PoliticianDashboard = lazy(() => import('./pages/PoliticianDashboard').then(m => ({ default: m.PoliticianDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ModeratorDashboard = lazy(() => import('./pages/ModeratorDashboard').then(m => ({ default: m.ModeratorDashboard })));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage').then(m => ({ default: m.IssueDetailPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const PetitionBoardPage = lazy(() => import('./pages/PetitionBoardPage').then(m => ({ default: m.PetitionBoardPage })));
const HeatmapPage = lazy(() => import('./pages/HeatmapPage').then(m => ({ default: m.HeatmapPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const MyIssuesPage = lazy(() => import('./pages/MyIssuesPage').then(m => ({ default: m.MyIssuesPage })));
const SlaEscalationPage = lazy(() => import('./pages/SlaEscalationPage').then(m => ({ default: m.SlaEscalationPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Activity className="h-6 w-6 text-indigo-500 animate-spin" />
    </div>
  );
}

function DashboardIndexRedirect() {
  const { user } = useUser();
  const { user: storeUser } = useStore();
  const role = storeUser?.role || (user?.publicMetadata?.role as string) || 'citizen';
  return <Navigate to={`/dashboard/${role}`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ErrorBoundary>
        <BrowserRouter>
        <SmoothScroll>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </SmoothScroll>
        </BrowserRouter>
        </ErrorBoundary>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
