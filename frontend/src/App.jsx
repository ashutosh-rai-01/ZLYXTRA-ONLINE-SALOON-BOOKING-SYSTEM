import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Welcome from './pages/user/Welcome';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import HomeDashboard from './pages/user/HomeDashboard';
import SmartMatch from './pages/user/SmartMatch';
import SmartResults from './pages/user/SmartResults';
import SalonDetails from './pages/user/SalonDetails';
import SlotSelection from './pages/user/SlotSelection';
import BookingConfirmation from './pages/user/BookingConfirmation';
import Success from './pages/user/Success';
import MyBookings from './pages/user/MyBookings';
import Profile from './pages/user/Profile';

// Import Owner Pages
import OwnerLogin from './pages/owner/OwnerLogin';
import SalonOnboarding from './pages/owner/SalonOnboarding';
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import BookingManagement from './pages/owner/BookingManagement';
import AvailabilityManager from './pages/owner/AvailabilityManager';
import ServicesManager from './pages/owner/ServicesManager';


// Import Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSalons from './pages/admin/AdminSalons';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

// Global Loader Wrapper to handle button clicks and route transition animations
function GlobalLoaderWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Trigger loader on location change (route transition)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450); // Smooth premium transition delay
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Intercept all button, link, and interactive element clicks
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const btn = e.target.closest('button, a, [role="button"]');
      if (btn) {
        // Exclude specific elements that have their own custom popups
        if (
          btn.classList.contains('no-loader') || 
          btn.getAttribute('data-no-loader') === 'true' ||
          btn.getAttribute('type') === 'button' && btn.closest('.form-group') // exclude simple toggles
        ) {
          return;
        }

        setLoading(true);
        // Safety timeout to dismiss loader if no navigation occurs
        const timer = setTimeout(() => {
          setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <>
      {children}
      {loading && (
        <div className="status-popup-overlay">
          <div className="status-popup-card" style={{ maxWidth: '180px', padding: '24px 16px', borderRadius: '20px' }}>
            <div className="spinner-ring">
              <div></div><div></div><div></div><div></div>
            </div>
            <h4 style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>Loading...</h4>
          </div>
        </div>
      )}
    </>
  );
}

// Strict Guard for Customer pages
const CustomerRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'user') {
    const route = user.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard';
    return <Navigate to={route} replace />;
  }
  return children;
};

// Strict Guard for Salon Owner pages
const OwnerRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'owner') {
    const route = user.role === 'admin' ? '/admin/dashboard' : '/home';
    return <Navigate to={route} replace />;
  }
  return children;
};

// Strict Guard for Admin pages
const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'admin') {
    const route = user.role === 'owner' ? '/owner/dashboard' : '/home';
    return <Navigate to={route} replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  // Initialize Theme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  if (loading) return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;


  // Smart redirect for logged in users
  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/home';
  };

  return (
    <Router>
      <GlobalLoaderWrapper>
        <Routes>
          <Route path="/" element={<Welcome />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardRoute()} />} />
        
        {/* Protected Customer Routes */}
        <Route path="/home" element={<CustomerRoute user={user}><HomeDashboard /></CustomerRoute>} />
        <Route path="/smart-match" element={<CustomerRoute user={user}><SmartMatch /></CustomerRoute>} />
        <Route path="/smart-results" element={<CustomerRoute user={user}><SmartResults /></CustomerRoute>} />
        <Route path="/salon/:id" element={<CustomerRoute user={user}><SalonDetails /></CustomerRoute>} />
        <Route path="/slot-selection" element={<CustomerRoute user={user}><SlotSelection /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute user={user}><BookingConfirmation /></CustomerRoute>} />
        <Route path="/success" element={<CustomerRoute user={user}><Success /></CustomerRoute>} />
        <Route path="/my-bookings" element={<CustomerRoute user={user}><MyBookings /></CustomerRoute>} />
        <Route path="/profile" element={<CustomerRoute user={user}><Profile /></CustomerRoute>} />

        {/* Owner Routes */}
        <Route path="/owner/login" element={!user ? <OwnerLogin /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/owner/onboarding" element={<OwnerRoute user={user}><SalonOnboarding /></OwnerRoute>} />
        <Route path="/owner" element={<OwnerRoute user={user}><OwnerLayout /></OwnerRoute>}>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="availability" element={<AvailabilityManager />} />
          <Route path="services" element={<ServicesManager />} />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/admin" element={<AdminRoute user={user}><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="salons" element={<AdminSalons />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      </GlobalLoaderWrapper>
    </Router>
  );
}

export default App;
