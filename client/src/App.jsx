// Updated App.jsx with Advertisement routes
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ReporterRoute from './components/auth/ReporterRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NewsDetailPage from './pages/NewsDetailPage';
import NotFoundPage from './pages/NotFoundPage';
// New page imports
import VideoNewsPage from './pages/VideoNewsPage';
import PeopleListPage from './pages/PeopleListPage';
import PersonNewsPage from './pages/PersonNewsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ReporterApplications from './pages/admin/ReporterApplications';
import NewsManagement from './pages/admin/NewsManagement';
import NewsEditor from './pages/admin/NewsEditor';
import ReporterManagement from './pages/admin/ReporterManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import PageManagement from './pages/admin/PageManagement';
import UserManagement from './pages/admin/UserManagement';
import SiteSettings from './pages/admin/SiteSettings';
// New admin pages
import PeopleManagement from './pages/admin/PeopleManagement';
import PersonEditor from './pages/admin/PersonEditor';
// Advertisement pages
import AdvertisementManagement from './pages/admin/AdvertisementManagement';
import AdvertisementEditor from './pages/admin/AdvertisementEditor';
import AdvertisementAnalytics from './pages/admin/AdvertisementAnalytics';

// Reporter pages
import ReporterDashboard from './pages/reporter/ReporterDashboard';
import CreateNews from './pages/reporter/CreateNews';
import EditNews from './pages/reporter/EditNews';
import ReporterStats from './pages/reporter/ReporterStats';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          {/* New public routes */}
          <Route path="videos" element={<VideoNewsPage />} />
          <Route path="people" element={<PeopleListPage />} />
          <Route path="people/:slug" element={<PersonNewsPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reporter-applications" element={<ReporterApplications />} />
            <Route path="news" element={<NewsManagement />} />
            <Route path="reporters" element={<ReporterManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="pages" element={<PageManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="news/create" element={<NewsEditor />} />
            <Route path="news/edit/:id" element={<NewsEditor />} />
            {/* People routes */}
            <Route path="people" element={<PeopleManagement />} />
            <Route path="people/create" element={<PersonEditor />} />
            <Route path="people/edit/:id" element={<PersonEditor />} />
            {/* Advertisement routes */}
            <Route path="advertisements" element={<AdvertisementManagement />} />
            <Route path="advertisements/create" element={<AdvertisementEditor />} />
            <Route path="advertisements/edit/:id" element={<AdvertisementEditor />} />
            <Route path="advertisements/analytics/:id" element={<AdvertisementAnalytics />} />
          </Route>
          
          {/* Reporter routes */}
          <Route element={<ReporterRoute />}>
            <Route path="reporter" element={<ReporterDashboard />} />
            <Route path="reporter/create" element={<CreateNews />} />
            <Route path="reporter/edit/:id" element={<EditNews />} />
            <Route path="reporter/stats" element={<ReporterStats />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;