import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';

// Lazy load all page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const HomePageManager = React.lazy(() => import('./pages/HomePageManager'));
const NavbarFooterManager = React.lazy(() => import('./pages/NavbarFooterManager'));
const MapLocationsManager = React.lazy(() => import('./pages/MapLocationsManager'));
const TeamManager = React.lazy(() => import('./pages/TeamManager'));
const ServicesManager = React.lazy(() => import('./pages/ServicesManager'));
const SelectClientsManager = React.lazy(() => import('./pages/SelectClientsManager'));
const HistoryManager = React.lazy(() => import('./pages/HistoryManager'));
const NetworkingManager = React.lazy(() => import('./pages/NetworkingManager'));
const NewsletterManager = React.lazy(() => import('./pages/NewsletterManager'));
const BlogPostsManager = React.lazy(() => import('./pages/BlogPostsManager'));
const AlumniManager = React.lazy(() => import('./pages/AlumniManager'));
const GalleryManager = React.lazy(() => import('./pages/GalleryManager'));
const CareersManager = React.lazy(() => import('./pages/CareersManager'));
const ContactManager = React.lazy(() => import('./pages/ContactManager'));
const SEOManager = React.lazy(() => import('./pages/SEOManager'));
const MediaLibrary = React.lazy(() => import('./pages/MediaLibrary'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FooterContactManager = React.lazy(() => import('./pages/FooterContactManager'));
const LegalPagesManager = React.lazy(() => import('./pages/LegalPagesManager'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#022683] mx-auto mb-4"></div>
      <p className="text-[#888888] text-sm">Loading page...</p>
    </div>
  </div>
);

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'home-page':
        return <HomePageManager />;
      case 'navbar-footer':
        return <NavbarFooterManager />;
      case 'footer-contact':
        return <FooterContactManager />;
      case 'map-locations':
        return <MapLocationsManager />;
      case 'team':
        return <TeamManager />;
      case 'services':
        return <ServicesManager />;
      case 'select-clients':
        return <SelectClientsManager />;
      case 'history':
        return <HistoryManager />;
      case 'networking':
        return <NetworkingManager />;
      case 'newsletter':
        return <NewsletterManager />;
      case 'blog':
        return <BlogPostsManager />;
      case 'alumni':
        return <AlumniManager />;
      case 'gallery':
        return <GalleryManager />;
      case 'careers':
        return <CareersManager />;
      case 'contact':
        return <ContactManager />;
      case 'seo':
        return <SEOManager />;
      case 'media':
        return <MediaLibrary />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      case 'legal-pages':
        return <LegalPagesManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0F1115] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </div>
    </div>
  );
}