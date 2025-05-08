import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isAdminOrReporterPanel = location.pathname.startsWith('/admin') || location.pathname.startsWith('/reporter');

  return (
    <div className="flex flex-col min-h-screen font-montserrat">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mt-20"> {/* Added mt-20 to create space below the fixed header */}
        <Outlet />
      </main>
      {!isAdminOrReporterPanel && <Footer />}
    </div>
  );
};

export default Layout;