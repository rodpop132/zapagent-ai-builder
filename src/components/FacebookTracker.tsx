
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFacebookTracking } from '@/hooks/useFacebookTracking';
import { useAuth } from '@/hooks/useAuth';

const FacebookTracker = () => {
  const location = useLocation();
  const { trackViewContent } = useFacebookTracking();
  const { user } = useAuth();

  useEffect(() => {
    // Track page views on route changes
    const handlePageView = async () => {
      let contentName = 'Page View';
      
      // Customize content name based on route
      switch (location.pathname) {
        case '/':
          contentName = 'Home Page';
          break;
        case '/dashboard':
          contentName = 'Dashboard';
          break;
        case '/auth':
          contentName = 'Auth Page';
          break;
        case '/sucesso':
          contentName = 'Success Page';
          break;
        case '/cancelado':
          contentName = 'Cancelled Page';
          break;
        default:
          contentName = `Page: ${location.pathname}`;
      }

      await trackViewContent(contentName, user?.email);
    };

    handlePageView();
  }, [location.pathname, trackViewContent, user?.email]);

  return null; // This component doesn't render anything
};

export default FacebookTracker;
