// src/components/layout/Layout.jsx - Updated with Ad Display Modes
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdDisplay from '../advertisements/AdDisplay';

const Layout = () => {
  const location = useLocation();
  const isAdminOrReporterPanel = location.pathname.startsWith('/admin') || location.pathname.startsWith('/reporter');
  
  // Determine current page for ad targeting
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/news/')) return 'news-detail';
    if (path.startsWith('/category/')) return `category-${path.split('/')[2]}`;
    if (path === '/videos') return 'videos';
    if (path.startsWith('/people')) return 'people';
    return 'other';
  };

  // Get device type (simplified)
  const getDeviceType = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'mobile' : 'desktop';
    }
    return 'desktop';
  };

  const currentPage = getCurrentPage();
  const deviceType = getDeviceType();

  return (
    <div className="flex flex-col min-h-screen font-montserrat relative">
      {/* Header Top Ad - Rotation Mode (if multiple ads) */}
      {!isAdminOrReporterPanel && (
        <AdDisplay 
          position="header-top" 
          page={currentPage} 
          device={deviceType}
          displayMode="rotation"
          rotationInterval={8000}
          className="w-full flex justify-center bg-gray-100 py-2"
        />
      )}
      
      <Header />
      
      {/* Header Bottom Ad - Priority Mode (show highest priority) */}
      {!isAdminOrReporterPanel && (
        <AdDisplay 
          position="header-bottom" 
          page={currentPage} 
          device={deviceType}
          displayMode="priority"
          className="w-full flex justify-center bg-gray-50 py-2"
        />
      )}
      
      <div className="flex flex-1">
        {/* Sidebar Left Ad - Random Mode */}
        {!isAdminOrReporterPanel && deviceType === 'desktop' && (
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 p-4">
              <AdDisplay 
                position="sidebar-left" 
                page={currentPage} 
                device={deviceType}
                displayMode="random"
                className="w-full"
              />
            </div>
          </aside>
        )}
        
        <main className="flex-grow container mx-auto px-4 py-8 mt-20 relative">
          {/* Content Top Ad - Rotation Mode */}
          {!isAdminOrReporterPanel && (
            <AdDisplay 
              position="content-top" 
              page={currentPage} 
              device={deviceType}
              displayMode="rotation"
              rotationInterval={12000}
              className="w-full flex justify-center mb-6"
            />
          )}
          
          <Outlet />
          
          {/* Content Bottom Ad - Show All */}
          {!isAdminOrReporterPanel && (
            <AdDisplay 
              position="content-bottom" 
              page={currentPage} 
              device={deviceType}
              displayMode="all"
              className="w-full flex justify-center mt-6"
            />
          )}
        </main>
        
        {/* Sidebar Right Ad - Rotation Mode with indicators */}
        {!isAdminOrReporterPanel && deviceType === 'desktop' && (
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 p-4">
              <AdDisplay 
                position="sidebar-right" 
                page={currentPage} 
                device={deviceType}
                displayMode="rotation"
                rotationInterval={15000}
                className="w-full"
              />
            </div>
          </aside>
        )}
      </div>
      
      {/* Footer Top Ad - Priority Mode */}
      {!isAdminOrReporterPanel && (
        <AdDisplay 
          position="footer-top" 
          page={currentPage} 
          device={deviceType}
          displayMode="priority"
          className="w-full flex justify-center bg-gray-50 py-4"
        />
      )}
      
      {!isAdminOrReporterPanel && <Footer />}
      
      {/* Footer Bottom Ad - Random Mode */}
      {!isAdminOrReporterPanel && (
        <AdDisplay 
          position="footer-bottom" 
          page={currentPage} 
          device={deviceType}
          displayMode="random"
          className="w-full flex justify-center bg-gray-100 py-2"
        />
      )}
      
      {/* Floating and Overlay Ads - Always show single ad */}
      {!isAdminOrReporterPanel && (
        <>
          <AdDisplay 
            position="floating-corner" 
            page={currentPage} 
            device={deviceType}
            displayMode="priority"
          />
          
          <AdDisplay 
            position="overlay-center" 
            page={currentPage} 
            device={deviceType}
            displayMode="priority"
          />
        </>
      )}
    </div>
  );
};

export default Layout;