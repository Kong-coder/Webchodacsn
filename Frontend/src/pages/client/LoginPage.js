import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { showToast } from "../../components/Toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'forgot-password'
  
  // Thêm state để theo dõi trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [headerType, setHeaderType] = useState('client');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  // Common state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      // Kiểm tra localStorage hoặc sessionStorage
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const savedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      
      if (token && savedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(savedUserInfo);
          setIsLoggedIn(true);
          setUserInfo(parsedUserInfo);
          
          // Xác định headerType dựa trên role
          if (parsedUserInfo.role === 'Nhân viên') {
            setHeaderType('staff');
          } else if (parsedUserInfo.role === 'Quản trị viên') {
            setHeaderType('admin');
          } else {
            setHeaderType('client');
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
    };

    checkLoginStatus();
  }, []);

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10,11}$/.test(phone);

  const handleLogin = async () => {
    setErrors({});
    if (!validateEmail(loginEmail)) {
      setErrors({ loginEmail: 'Email không hợp lệ' });
      return;
    }
    if (!loginPassword) {
      setErrors({ loginPassword: 'Vui lòng nhập mật khẩu' });
      return;
    }

    setLoading(true);
    setLoginStatus('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Invalid credentials');
      }

      const jwtResponse = await response.json();
      const { token, id, username, email, fullName, phone, address, birthDate, roles } = jwtResponse;

      console.log('=== LOGIN DEBUG ===');
      console.log('Roles from backend:', roles);
      console.log('Roles type:', typeof roles);
      console.log('Is array?', Array.isArray(roles));

      const userData = {
        id,
        fullName: fullName || username, // Use fullName from backend (ho_ten), fallback to username
        name: fullName || username, // Also set name for compatibility
        email,
        phone: phone || '',
        address: address || '',
        birthDate: birthDate || '',
        role: roles && roles.length > 0 ? roles[0] : 'Khách hàng', // Use the first role
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('userToken', token);
      storage.setItem('userInfo', JSON.stringify(userData));

      // Notify other parts of the app (like Header)
      window.dispatchEvent(new Event("userInfoChanged"));

      setIsLoggedIn(true);
      setUserInfo(userData);
      
      let redirectPath = "/";
      console.log('Checking roles for redirect...');
      console.log('roles.includes("QuanLy"):', roles.includes('QuanLy'));
      console.log('roles.includes("NhanVien"):', roles.includes('NhanVien'));
      
      if (roles.includes('QuanLy')) {
        redirectPath = "/CustomerManagement";
        console.log('Redirecting to CustomerManagement');
      } else if (roles.includes('NhanVien')) {
        redirectPath = "/BookingManagement";
        console.log('Redirecting to BookingManagement');
      } else {
        console.log('Redirecting to home');
      }

      console.log('Final redirectPath:', redirectPath);

      // Show toast notification
      showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      setLoginStatus(`Đăng nhập thành công! Đang chuyển hướng...`);
      setTimeout(() => {
        console.log('Navigating to:', redirectPath);
        navigate(redirectPath);
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Email hoặc mật khẩu không chính xác.' });
    } finally {
      setLoading(false);
    }
  };

  // Register handlers
  const handleRegister = async () => {
    setErrors({});
    
    // Basic frontend validation
    if (!registerData.fullName.trim()) return setErrors({ fullName: 'Vui lòng nhập họ và tên' });
    if (!validateEmail(registerData.email)) return setErrors({ email: 'Email không hợp lệ' });
    if (!validatePhone(registerData.phone)) return setErrors({ phone: 'Số điện thoại không hợp lệ' });
    if (registerData.password.length < 6) return setErrors({ password: 'Mật khẩu phải có ít nhất 6 ký tự' });
    if (registerData.password !== registerData.confirmPassword) return setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
    if (!agreeToTerms) return setErrors({ terms: 'Vui lòng đồng ý với Điều khoản dịch vụ' });

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              fullName: registerData.fullName,
              email: registerData.email,
              phone: registerData.phone,
              password: registerData.password,
          }),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Registration failed');
      }

      showToast('Đăng ký thành công! Vui lòng đăng nhập', 'success');
      setCurrentPage('login');
      setLoginEmail(registerData.email); // Pre-fill login form
      
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ general: `Đăng ký thất bại: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handlers
  const handleSendResetEmail = async () => {
    setErrors({});
    
    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: 'Vui lòng nhập email' });
      return;
    }
    
    if (!validateEmail(forgotEmail)) {
      setErrors({ forgotEmail: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      setForgotStep(2);
      showToast('Mã xác nhận đã được gửi đến email của bạn!', 'success');
    } catch (error) {
      console.error('Send reset email error:', error);
      setErrors({ forgotEmail: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    setErrors({});
    
    if (!verificationCode.trim()) {
      setErrors({ code: 'Vui lòng nhập mã xác nhận' });
      return;
    }

    setForgotStep(3);
  };

  const handleResetPassword = async () => {
    setErrors({});
    
    if (!newPassword.trim()) {
      setErrors({ newPassword: 'Vui lòng nhập mật khẩu mới' });
      return;
    }
    
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/password-reset/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      showToast('Đặt lại mật khẩu thành công!', 'success');
      setCurrentPage('login');
      
      // Reset forgot password state
      setForgotStep(1);
      setForgotEmail('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/${provider}/login`;
  };

  const handleBackendLoginSuccess = (jwtResponse, remember) => {
    const { token, id, username, email, fullName, phone, address, birthDate, roles } = jwtResponse;
    const userData = {
      id,
      fullName: fullName || username, // Use fullName from backend (ho_ten), fallback to username
      name: fullName || username, // Also set name for compatibility
      email,
      phone: phone || '',
      address: address || '',
      birthDate: birthDate || '',
      role: roles && roles.length > 0 ? roles[0] : 'Khách hàng',
    };

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('userToken', token);
    storage.setItem('userInfo', JSON.stringify(userData));

    window.dispatchEvent(new Event("userInfoChanged"));

    setIsLoggedIn(true);
    setUserInfo(userData);

    let redirectPath = "/";
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_QUANLY')) {
      redirectPath = "/CustomerManagement";
    } else if (roles.includes('ROLE_NHANVIEN')) {
      redirectPath = "/BookingManagement";
    }

    setLoginStatus(`Đăng nhập thành công! Đang chuyển hướng...`);
    setTimeout(() => navigate(redirectPath), 1500);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const googleIdToken = credentialResponse.credential;
      
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleIdToken }),
      });

      if (!response.ok) {
        throw new Error('Google authentication with backend failed.');
      }

      const jwtResponse = await response.json();
      handleBackendLoginSuccess(jwtResponse, true); // Assume rememberMe for social logins

    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ general: 'Đăng nhập với Google thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
    setErrors({});
    setLoading(false);
    setLoginStatus('');
    
    if (page === 'forgot-password') {
      setForgotStep(1);
      setForgotEmail('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  // Get page titles
  const getPageTitle = () => {
    if (currentPage === 'login') return 'Đăng nhập';
    if (currentPage === 'register') return 'Đăng ký';
    if (currentPage === 'forgot-password') {
      if (forgotStep === 1) return 'Quên mật khẩu';
      if (forgotStep === 2) return 'Xác nhận email';
      if (forgotStep === 3) return 'Tạo mật khẩu mới';
    }
    return 'BeautySpa';
  };

  const getPageSubtitle = () => {
    if (currentPage === 'login') return 'Chào mừng bạn trở lại với BeautySpa';
    if (currentPage === 'register') return 'Tạo tài khoản mới để trải nghiệm dịch vụ tốt nhất';
    if (currentPage === 'forgot-password') {
      if (forgotStep === 1) return 'Chúng tôi sẽ giúp bạn khôi phục quyền truy cập tài khoản';
      if (forgotStep === 2) return 'Vui lòng kiểm tra email và nhập mã xác nhận';
      if (forgotStep === 3) return 'Hãy tạo mật khẩu mạnh để bảo vệ tài khoản';
    }
    return 'Trung tâm làm đẹp chuyên nghiệp';
  };


  // Render functions for each page
  const renderLoginPage = () => (
    <div className="container pb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark mb-2">Đăng nhập tài khoản</h3>
                <p className="text-muted">Truy cập vào tài khoản BeautySpa của bạn</p>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2A2 2 0 0 0 0 4v.793c.106.029.213.055.319.08.686.139 1.513.267 2.681.267 3.13 0 6-.783 6-2.5V4a2 2 0 0 0-2-2H2Z"/>
                      <path d="M.213 4.492C.288 4.35.357 4.206.418 4.058L8 8.58l7.582-4.522c.061.148.13.292.205.434C15.927 4.773 16 5.076 16 5.5v5A2.5 2.5 0 0 1 13.5 13h-11A2.5 2.5 0 0 1 0 10.5v-5c0-.424.073-.727.213-1.008Z"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className={`form-control border-start-0 py-3 ${errors.loginEmail ? 'is-invalid' : ''}`}
                    placeholder="Nhập email của bạn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                {errors.loginEmail && <div className="text-danger mt-2 small">{errors.loginEmail}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">Mật khẩu</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 py-3 ${errors.loginPassword ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      {showLoginPassword ? (
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                      ) : (
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.loginPassword && <div className="text-danger mt-2 small">{errors.loginPassword}</div>}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label text-muted">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  style={{color: '#e91e63'}}
                  onClick={() => navigateTo('forgot-password')}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button 
                className="btn w-100 py-3 fw-semibold text-white mb-4"
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  border: 'none',
                  borderRadius: '10px'
                }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Đang nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              <div className="text-center mb-4">
                <span className="text-muted">Chưa có tài khoản? </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  style={{color: '#e91e63'}}
                  onClick={() => navigateTo('register')}
                >
                  Đăng ký ngay
                </button>
              </div>

              <div className="text-center mb-3">
                <span className="text-muted">Hoặc đăng nhập với</span>
              </div>
              <div className="d-flex gap-2">
                <div className="flex-fill">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      setErrors({ general: 'Đăng nhập với Google thất bại.' });
                    }}
                    width="100%"
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>
                <button 
                  className="btn flex-fill py-2 text-white" 
                  style={{backgroundColor: '#1877f2'}}
                  onClick={() => window.location.href = '/api/auth/facebook/login'}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Register page
  const renderRegisterPage = () => (
    <div className="container pb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark mb-2">Tạo tài khoản mới</h3>
                <p className="text-muted">Điền thông tin để tạo tài khoản BeautySpa</p>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Họ và tên *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 py-2 ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="Nhập họ và tên đầy đủ"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                  />
                </div>
                {errors.fullName && <div className="text-danger mt-2 small">{errors.fullName}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Email *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2A2 2 0 0 0 0 4v.793c.106.029.213.055.319.08.686.139 1.513.267 2.681.267 3.13 0 6-.783 6-2.5V4a2 2 0 0 0-2-2H2Z"/>
                      <path d="M.213 4.492C.288 4.35.357 4.206.418 4.058L8 8.58l7.582-4.522c.061.148.13.292.205.434C15.927 4.773 16 5.076 16 5.5v5A2.5 2.5 0 0 1 13.5 13h-11A2.5 2.5 0 0 1 0 10.5v-5c0-.424.073-.727.213-1.008Z"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className={`form-control border-start-0 py-2 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Nhập địa chỉ email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  />
                </div>
                {errors.email && <div className="text-danger mt-2 small">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Số điện thoại *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.98 10.94a6.678 6.678 0 0 1-1.897-.925 6.678 6.678 0 0 1-.925-1.897l.54-2.805a.678.678 0 0 0-.122-.58L5.772 2.426a.678.678 0 0 0-.58-.122z"/>
                    </svg>
                  </span>
                  <input
                    type="tel"
                    className={`form-control border-start-0 py-2 ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Nhập số điện thoại"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  />
                </div>
                {errors.phone && <div className="text-danger mt-2 small">{errors.phone}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Mật khẩu *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                  </span>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 py-2 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      {showRegisterPassword ? (
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                      ) : (
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <div className="text-danger mt-2 small">{errors.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Xác nhận mật khẩu *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                  </span>
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 py-2 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      {showRegisterConfirmPassword ? (
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                      ) : (
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && <div className="text-danger mt-2 small">{errors.confirmPassword}</div>}
              </div>

              <div className="mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <label className="form-check-label text-muted small">
                    Tôi đồng ý với <a href="#" className="text-decoration-none" style={{color: '#e91e63'}}>Điều khoản dịch vụ</a> và <a href="#" className="text-decoration-none" style={{color: '#e91e63'}}>Chính sách bảo mật</a>
                  </label>
                </div>
                {errors.terms && <div className="text-danger mt-2 small">{errors.terms}</div>}
              </div>

              <button 
                className="btn w-100 py-3 fw-semibold text-white mb-4"
                style={{
                  background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                  border: 'none',
                  borderRadius: '10px'
                }}
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>

              <div className="text-center mb-4">
                <span className="text-muted">Đã có tài khoản? </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  style={{color: '#e91e63'}}
                  onClick={() => navigateTo('login')}
                >
                  Đăng nhập ngay
                </button>
              </div>

              <div className="text-center mb-3">
                <span className="text-muted">Hoặc đăng ký với</span>
              </div>
              <div className="d-flex gap-2">
                <div className="flex-fill">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      setErrors({ general: 'Đăng ký với Google thất bại.' });
                    }}
                    width="100%"
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
                <button 
                  className="btn flex-fill py-2 text-white" 
                  style={{backgroundColor: '#1877f2'}}
                  onClick={() => window.location.href = '/api/auth/facebook/login'}
                >
                  <svg className="me-2" width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                        

  // Forgot Password pages
  const renderForgotPasswordPage = () => {
    if (forgotStep === 1) {
      return (
        <div className="container pb-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold text-dark mb-2">Quên mật khẩu</h3>
                    <p className="text-muted">Nhập email để nhận liên kết đặt lại mật khẩu</p>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2 2A2 2 0 0 0 0 4v.793c.106.029.213.055.319.08.686.139 1.513.267 2.681.267 3.13 0 6-.783 6-2.5V4a2 2 0 0 0-2-2H2Z"/>
                          <path d="M.213 4.492C.288 4.35.357 4.206.418 4.058L8 8.58l7.582-4.522c.061.148.13.292.205.434C15.927 4.773 16 5.076 16 5.5v5A2.5 2.5 0 0 1 13.5 13h-11A2.5 2.5 0 0 1 0 10.5v-5c0-.424.073-.727.213-1.008Z"/>
                        </svg>
                      </span>
                      <input
                        type="email"
                        className={`form-control border-start-0 py-3 ${errors.forgotEmail ? 'is-invalid' : ''}`}
                        placeholder="Nhập địa chỉ email của bạn"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                    {errors.forgotEmail && <div className="text-danger mt-2 small">{errors.forgotEmail}</div>}
                  </div>

                  <button 
                    className="btn w-100 py-3 fw-semibold text-white mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      border: 'none',
                      borderRadius: '10px'
                    }}
                    onClick={handleSendResetEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Đang gửi...
                      </div>
                    ) : (
                      'Gửi email xác nhận'
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-muted">Nhớ mật khẩu? </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{color: '#e91e63'}}
                      onClick={() => navigateTo('login')}
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (forgotStep === 2) {
      return (
        <div className="container pb-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                        <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Kiểm tra email</h3>
                    <p className="text-muted">
                      Chúng tôi đã gửi mã xác nhận 6 chữ số đến<br />
                      <strong>{forgotEmail}</strong>
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Mã xác nhận</label>
                    <input
                      type="text"
                      className={`form-control text-center py-3 ${errors.code ? 'is-invalid' : ''}`}
                      placeholder="Nhập mã 6 chữ số"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{fontSize: '1.5rem', letterSpacing: '0.5rem', fontFamily: 'monospace'}}
                      maxLength="6"
                    />
                    {errors.code && <div className="text-danger mt-2 small">{errors.code}</div>}
                  </div>

                  <button 
                    className="btn w-100 py-3 fw-semibold text-white mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      border: 'none',
                      borderRadius: '10px'
                    }}
                    onClick={handleVerifyCode}
                  >
                    Xác nhận mã
                  </button>

                  <div className="text-center mb-3">
                    <span className="text-muted">Không nhận được mã? </span>
                    <button 
                      type="button" 
                      className="btn btn-link p-0 fw-semibold text-decoration-none"
                      style={{color: '#e91e63'}}
                      onClick={() => handleSendResetEmail()}
                      disabled={loading}
                    >
                      {loading ? 'Đang gửi...' : 'Gửi lại'}
                    </button>
                  </div>

                  <div className="text-center">
                    <button 
                      type="button" 
                      className="btn btn-link text-muted text-decoration-none"
                      onClick={() => setForgotStep(1)}
                    >
                      ← Quay lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (forgotStep === 3) {
      return (
        <div className="container pb-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold text-dark mb-2">Đặt lại mật khẩu</h3>
                    <p className="text-muted">Tạo mật khẩu mới cho tài khoản của bạn</p>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Mật khẩu mới</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        </svg>
                      </span>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className={`form-control border-start-0 border-end-0 py-3 ${errors.newPassword ? 'is-invalid' : ''}`}
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          {showNewPassword ? (
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                          ) : (
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          )}
                        </svg>
                      </button>
                    </div>
                    {errors.newPassword && <div className="text-danger mt-2 small">{errors.newPassword}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">Xác nhận mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        </svg>
                      </span>
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        className={`form-control border-start-0 border-end-0 py-3 ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          {showConfirmNewPassword ? (
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                          ) : (
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          )}
                        </svg>
                      </button>
                    </div>
                    {errors.confirmNewPassword && <div className="text-danger mt-2 small">{errors.confirmNewPassword}</div>}
                  </div>

                  <button 
                    className="btn w-100 py-3 fw-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                      border: 'none',
                      borderRadius: '10px'
                    }}
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Đang cập nhật...
                      </div>
                    ) : (
                      'Cập nhật mật khẩu'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  // Main render
  return (
    <div style={{
      background: 'linear-gradient(135deg, #e74c3c 0%, #f39c12 100%)',
      minHeight: '100vh'
    }}>
      {/* Truyền đúng props cho Header */}
      {/* <Header 
        headerType={headerType}
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
      /> */}

      {/* Hero Section */}
      <div className="text-center text-white py-5">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">{getPageTitle()}</h1>
          <p className="lead">{getPageSubtitle()}</p>
        </div>
      </div>

      {/* Main Content */}
      {currentPage === 'login' && renderLoginPage()}
      {currentPage === 'register' && renderRegisterPage()}
      {currentPage === 'forgot-password' && renderForgotPasswordPage()}
    
    </div>
  );
};

export default LoginPage;
