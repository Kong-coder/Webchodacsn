import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/client/Home";
import BookingPage from "./pages/client/BookingPage";
import LoginPage from "./pages/client/LoginPage";
import NotificationsPage from "./pages/client/NotificationsPage";
import Service from "./pages/client/Service";
import AppointmentManager from "./pages/client/AppointmentManager";
import ServiceRating from "./pages/client/ServiceRating";
import PaymentResult from "./pages/client/PaymentResult";

import BookingManagement from "./pages/staff/BookingManagement";
import Calendar from "./pages/staff/Calendar";
import CustomerCareSystem from "./pages/staff/CustomerCareSystem";
import PaymentInvoice from "./pages/staff/PaymentInvoice";

import CustomerManagement from "./pages/admin/CustomerManagement";
import HRManagementSystem from "./pages/admin/HRManagementSystem";
import Quanly from "./pages/admin/Quanly";
import SpaProductManagement from "./pages/admin/SpaProductManagement";
import SpaRevenueDashboard from "./pages/admin/SpaRevenueDashboard";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";

import QRCheckInPage from "./pages/attendance/QRCheckInPage";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AboutPage from "./components/AboutPage";
import ToastContainer from "./components/Toast";
import ConfirmModal from "./components/ConfirmModal";

// A component to handle the logic after social login redirect
const SocialLoginHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSocialLoginToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        // 1. Store the token
        localStorage.setItem('userToken', token);

        try {
          // 2. Fetch user profile with the new token
          const profileRes = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!profileRes.ok) {
            throw new Error('Failed to fetch user profile after social login.');
          }

          const userInfo = await profileRes.json();

          // 3. Store user info
          localStorage.setItem('userInfo', JSON.stringify(userInfo));

          // 4. Notify other components
          window.dispatchEvent(new Event("userInfoChanged"));

          // 5. Clean URL and redirect
          window.history.replaceState({}, document.title, window.location.pathname);
          
          const roles = userInfo.roles || [];
          let redirectPath = "/";
          if (roles.includes('QuanLy')) {
            redirectPath = "/CustomerManagement";
          } else if (roles.includes('NhanVien')) {
            redirectPath = "/BookingManagement";
          }
          navigate(redirectPath);

        } catch (error) {
          console.error(error);
          // Clean up failed login attempt
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          navigate('/LoginPage'); // Redirect to login on failure
        }
      }
    };

    handleSocialLoginToken();
  }, [navigate]);

  return null; // This component does not render anything
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <ConfirmModal />
      <Header />
      <SocialLoginHandler /> {/* Add the handler to the app */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/BookingPage" element={<BookingPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />
        <Route path="/Service" element={<Service />} />
        <Route path="AppointmentManager" element={<AppointmentManager />} />
        <Route path="ServiceRating" element={<ServiceRating />} />
        <Route path="/client/payment-result" element={<PaymentResult />} />

        <Route path="/AboutPage" element={<AboutPage />} />

        <Route path="/BookingManagement" element={<BookingManagement />} />
        <Route path="/Calendar"  element={<Calendar />} />
        <Route path="/CustomerCareSystem" element={<CustomerCareSystem />} />
       <Route path="/PaymentInvoice" element={<PaymentInvoice />} />


        <Route path="/CustomerManagement" element={<CustomerManagement />} />
        <Route path="/HRManagementSystem" element={<HRManagementSystem />} />
        <Route path="/Quanly" element={<Quanly />} />
        <Route path="/InventoryManagement" element={<InventoryManagement />} />
        <Route path="/SpaRevenueDashboard" element={<SpaRevenueDashboard />} />
        <Route path="/AttendanceManagement" element={<AttendanceManagement />} />
        
        <Route path="/attendance/checkin" element={<QRCheckInPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
