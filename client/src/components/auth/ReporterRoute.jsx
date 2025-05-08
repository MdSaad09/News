import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ReporterRoute = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user || (user.role !== 'reporter' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default ReporterRoute;