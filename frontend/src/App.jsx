import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardRoute()} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardRoute()} />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={user ? <HomeDashboard /> : <Navigate to="/" />} />
        <Route path="/smart-match" element={user ? <SmartMatch /> : <Navigate to="/" />} />
        <Route path="/smart-results" element={user ? <SmartResults /> : <Navigate to="/" />} />
        <Route path="/salon/:id" element={user ? <SalonDetails /> : <Navigate to="/" />} />
        <Route path="/slot-selection" element={user ? <SlotSelection /> : <Navigate to="/" />} />
        <Route path="/checkout" element={user ? <BookingConfirmation /> : <Navigate to="/" />} />
        <Route path="/success" element={user ? <Success /> : <Navigate to="/" />} />
        <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />

        {/* Owner Routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/onboarding" element={<SalonOnboarding />} />
        <Route path="/owner" element={<OwnerLayout />}>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="availability" element={<AvailabilityManager />} />
          <Route path="services" element={<ServicesManager />} />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="salons" element={<AdminSalons />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
