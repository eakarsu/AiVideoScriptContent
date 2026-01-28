import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      {/* Specialized Pages */}
      <Route
        path="/scripts"
        element={
          <PrivateRoute>
            <ScriptsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/titles"
        element={
          <PrivateRoute>
            <TitlesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/descriptions"
        element={
          <PrivateRoute>
            <DescriptionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/hashtags"
        element={
          <PrivateRoute>
            <HashtagsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/thumbnails"
        element={
          <PrivateRoute>
            <ThumbnailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/hooks"
        element={
          <PrivateRoute>
            <HooksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/trends"
        element={
          <PrivateRoute>
            <TrendsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/seo"
        element={
          <PrivateRoute>
            <SEOPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/personas"
        element={
          <PrivateRoute>
            <PersonasPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/repurpose"
        element={
          <PrivateRoute>
            <RepurposePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics-dashboard"
        element={
          <PrivateRoute>
            <AnalyticsDashboardPage />
          </PrivateRoute>
        }
      />
      {/* Keep generic feature page as fallback */}
      <Route
        path="/feature/:featureId"
        element={
          <PrivateRoute>
            <FeaturePage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
