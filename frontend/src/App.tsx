import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import FeaturePage from './pages/FeaturePage';
import ScriptsPage from './pages/ScriptsPage';
import TitlesPage from './pages/TitlesPage';
import DescriptionsPage from './pages/DescriptionsPage';
import HashtagsPage from './pages/HashtagsPage';
import ThumbnailsPage from './pages/ThumbnailsPage';
import HooksPage from './pages/HooksPage';
import CalendarPage from './pages/CalendarPage';
import TrendsPage from './pages/TrendsPage';
import SEOPage from './pages/SEOPage';
import PersonasPage from './pages/PersonasPage';
import RepurposePage from './pages/RepurposePage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import CaptionsPage from './pages/CaptionsPage';
import CtasPage from './pages/CtasPage';
import ViralPredictionsPage from './pages/ViralPredictionsPage';
import VideoSummariesPage from './pages/VideoSummariesPage';
import PodcastTranscriptsPage from './pages/PodcastTranscriptsPage';
import IdeasPage from './pages/IdeasPage';
import CommentsPage from './pages/CommentsPage';
import CompetitorsPage from './pages/CompetitorsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="text-sm text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

            {/* Content Pages */}
            <Route path="/scripts" element={<PrivateRoute><ScriptsPage /></PrivateRoute>} />
            <Route path="/titles" element={<PrivateRoute><TitlesPage /></PrivateRoute>} />
            <Route path="/descriptions" element={<PrivateRoute><DescriptionsPage /></PrivateRoute>} />
            <Route path="/hashtags" element={<PrivateRoute><HashtagsPage /></PrivateRoute>} />
            <Route path="/thumbnails" element={<PrivateRoute><ThumbnailsPage /></PrivateRoute>} />
            <Route path="/hooks" element={<PrivateRoute><HooksPage /></PrivateRoute>} />
            <Route path="/captions" element={<PrivateRoute><CaptionsPage /></PrivateRoute>} />

            {/* AI Tools Pages */}
            <Route path="/ctas" element={<PrivateRoute><CtasPage /></PrivateRoute>} />
            <Route path="/viral-predictions" element={<PrivateRoute><ViralPredictionsPage /></PrivateRoute>} />
            <Route path="/video-summaries" element={<PrivateRoute><VideoSummariesPage /></PrivateRoute>} />
            <Route path="/podcast-transcripts" element={<PrivateRoute><PodcastTranscriptsPage /></PrivateRoute>} />

            {/* Research Tools */}
            <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
            <Route path="/trends" element={<PrivateRoute><TrendsPage /></PrivateRoute>} />
            <Route path="/seo" element={<PrivateRoute><SEOPage /></PrivateRoute>} />
            <Route path="/personas" element={<PrivateRoute><PersonasPage /></PrivateRoute>} />
            <Route path="/repurpose" element={<PrivateRoute><RepurposePage /></PrivateRoute>} />
            <Route path="/ideas" element={<PrivateRoute><IdeasPage /></PrivateRoute>} />
            <Route path="/comments" element={<PrivateRoute><CommentsPage /></PrivateRoute>} />
            <Route path="/competitors" element={<PrivateRoute><CompetitorsPage /></PrivateRoute>} />
            <Route path="/analytics-dashboard" element={<PrivateRoute><AnalyticsDashboardPage /></PrivateRoute>} />

            {/* Generic feature page fallback */}
            <Route path="/feature/:featureId" element={<PrivateRoute><FeaturePage /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
