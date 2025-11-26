import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // State cho role và userInfo
  const [headerType, setHeaderType] = useState("guest");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settingsForm, setSettingsForm] = useState({
    theme: "light",
    language: "vi",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  });
  // Modal handlers
  const openChangePasswordModal = () => setShowChangePasswordModal(true);
  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };
  //model profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: userInfo?.fullName || userInfo?.name || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    address: userInfo?.address || "",
    birthDate: userInfo?.birthDate || "",
    gender: userInfo?.gender || "male",
  });

  const openProfileModal = () => {
    // Load thông tin hiện tại vào form
    setProfileForm({
      fullName: userInfo?.fullName || userInfo?.name || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      address: userInfo?.address || "",
      birthDate: userInfo?.birthDate || "",
      gender: userInfo?.gender || "male",
    });
    setShowProfileModal(true);
  };

  const closeProfileModal = () => setShowProfileModal(false);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validate form
    if (!profileForm.fullName.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    if (!profileForm.email.trim()) {
      alert("Vui lòng nhập email!");
      return;
    }

    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('User ID:', userInfo?.id);
    console.log('Profile Form:', profileForm);

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại!');
        navigate('/LoginPage');
        return;
      }

      if (!userInfo?.id) {
        alert('Không tìm thấy thông tin người dùng!');
        return;
      }

      // Call API to update profile - Use /api/user/profile endpoint
      // This endpoint works for ALL roles (KhachHang, NhanVien, QuanLy)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.fullName,
          email: profileForm.email,
          phone: profileForm.phone,
          address: profileForm.address,
          birthDate: profileForm.birthDate,
          gender: profileForm.gender
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Update successful:', result);
      console.log('=== END PROFILE UPDATE DEBUG ===');

      // Update userInfo in localStorage/sessionStorage
      const updatedUserInfo = {
        ...userInfo,
        fullName: profileForm.fullName,
        name: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
        birthDate: profileForm.birthDate,
      };

      // Update localStorage
      if (localStorage.getItem("userInfo")) {
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      }
      if (sessionStorage.getItem("userInfo")) {
        sessionStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      }

      // Update state
      setUserInfo(updatedUserInfo);

      alert("Cập nhật thông tin thành công!");
      closeProfileModal();

      // Trigger event để header cập nhật
      window.dispatchEvent(new Event("userInfoChanged"));

    } catch (error) {
      console.error('Profile update error:', error);
      alert(`Lỗi khi cập nhật thông tin: ${error.message}`);
    }
  };

  const openSettingsModal = () => setShowSettingsModal(true);
  const closeSettingsModal = () => setShowSettingsModal(false);

  // Handle password change
  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      alert("Đổi mật khẩu thành công!");
      closeChangePasswordModal();
    }, 1000);
  };

  // Handle settings update
  const handleSettingsUpdate = (e) => {
    e.preventDefault();

    // Simulate API call
    setTimeout(() => {
      alert("Cập nhật cài đặt thành công!");
      closeSettingsModal();
    }, 1000);
  };

  useEffect(() => {
    const checkUserInfo = () => {
      const savedUserInfo =
        localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");

      if (savedUserInfo) {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedUserInfo);
        setIsLoggedIn(true);
        console.log('=== HEADER DEBUG ===');
        console.log('User role:', parsedUserInfo.role);
        
        setHeaderType(
          parsedUserInfo.role === "NhanVien"
            ? "staff"
            : parsedUserInfo.role === "QuanLy"
            ? "admin"
            : "client"
        );
        
        console.log('Header type set to:', parsedUserInfo.role === "NhanVien" ? "staff" : parsedUserInfo.role === "QuanLy" ? "admin" : "client");
      } else {
        setHeaderType("guest");
        setIsLoggedIn(false);
      }
    };

    checkUserInfo(); // chạy 1 lần khi mount

    window.addEventListener("userInfoChanged", checkUserInfo); // 👈 nghe custom event
    return () => window.removeEventListener("userInfoChanged", checkUserInfo);
  }, []);

  // Navigation configurations for different user types
  const navigationConfig = {
    // Navigation cho người dùng chưa đăng nhập (guest)
    guest: [
      { path: "/", label: "Trang chủ" },
      { path: "/Service", label: "Dịch vụ" },
      { path: "/AboutPage", label: "Thông tin về chúng tôi" },
    ],
    // Navigation cho client đã đăng nhập
    client: [
      { path: "/", label: "Trang chủ" },
      { path: "/Service", label: "Dịch vụ" },
      { path: "/BookingPage", label: "Đặt lịch" },
      { path: "/AppointmentManager", label: "Lịch hẹn" },
      { path: "/ServiceRating", label: "Đánh giá" },
      { path: "/NotificationsPage", label: "Thông báo" },
    ],
    // Navigation cho staff
      staff: [
      { path: "/BookingManagement", label: "Quản lý Đặt lịch" },
      { path: "/Calendar", label: "Lịch làm việc" },
      { path: "/PaymentInvoice", label: "Thanh toán" },
      { path: "/CustomerCareSystem", label: "Chăm sóc khách hàng" },
    ],
    // Navigation cho admin
    admin: [
      { path: "/CustomerManagement", label: "Quản lý khách hàng" },
      { path: "/HRManagementSystem", label: "Quản lý nhân sự" },
      { path: "/Quanly", label: "Quản lý dịch vụ" },
      { path: "/InventoryManagement", label: "Kho sản phẩm" },
      { path: "/SpaRevenueDashboard", label: "Thống kê & doanh thu" },
    ],
  };

  // User menu configurations
  const userMenuConfig = {
    client: [
      {
        key: "profile",
        label: "Thông tin cá nhân",
        icon: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z",
      },
      {
        key: "bookingHistory",
        label: "Lịch sử đặt lịch",
        icon: "M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z",
      },
      {
        key: "settings",
        label: "Cài đặt",
        icon: "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z",
      },
    ],
    staff: [
      {
        key: "profile",
        label: "Thông tin cá nhân",
        description: "Xem và chỉnh sửa hồ sơ",
        icon: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z",
      },
      {
        key: "changePassword",
        label: "Đổi mật khẩu",
        description: "Cập nhật mật khẩu bảo mật",
        icon: "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z",
      },
      {
        key: "settings",
        label: "Cài đặt tài khoản",
        description: "Tùy chỉnh giao diện và thông báo",
        icon: "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z",
      },
    ],
    admin: [
      {
        key: "profile",
        label: "Thông tin quản trị",
        description: "Cài đặt tài khoản admin",
        icon: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z",
      },
      {
        key: "systemSettings",
        label: "Cài đặt hệ thống",
        description: "Quản lý cấu hình hệ thống",
        icon: "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z",
      },
      {
        key: "backup",
        label: "Sao lưu dữ liệu",
        description: "Quản lý backup hệ thống",
        icon: "M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z",
      },
    ],
  };

  // Get subtitle based on header type
  const getSubtitle = () => {
    switch (headerType) {
      case "staff":
        return "Staff Portal";
      case "admin":
        return "Admin Panel";
      default:
        return "Luxury & Wellness";
    }
  };

  // Get quick action button config
  const getQuickActionButton = () => {
    // Chỉ hiển thị quick action cho staff
    if (headerType === "staff" && isLoggedIn) {
      return {
        label: "+ Tạo lịch hẹn",
        onClick: () => navigate("/Bookingmanager"),
        show: true,
      };
    }

    return { show: false };
  };

  // Function to check if current path matches nav item
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to get nav link styles based on active state
  const getNavLinkStyles = (path) => {
    const baseStyles = {
      fontWeight: "600",
      transition: "all 0.3s ease",
      textDecoration: "none",
    };

    if (isActive(path)) {
      return {
        ...baseStyles,
        color: "#e74c3c",
        backgroundColor: "#fef2f2",
        transform: "translateY(-1px)",
      };
    }

    return {
      ...baseStyles,
      color: "#6b7280",
      backgroundColor: "transparent",
    };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle menu item clicks
  const handleMenuClick = (menuKey) => {
    setShowUserDropdown(false);

    switch (menuKey) {
      case "profile":
        // Mở modal thông tin cá nhân
        openProfileModal();
        break;
      case "bookingHistory":
        // Chuyển đến lịch sử đặt lịch
        navigate("/booking-history");
        break;
      case "changePassword":
        // Mở modal đổi mật khẩu
        openChangePasswordModal();
        break;
      case "systemSettings":
        // Chuyển đến cài đặt hệ thống
        navigate("/system-settings");
        break;
      case "backup":
        // Chuyển đến trang sao lưu dữ liệu
        navigate("/backup");
        break;
      case "settings":
        // Mở modal cài đặt
        openSettingsModal();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("userInfo");

      setIsLoggedIn(false);
      setHeaderType("guest");
      setUserInfo(null);

      alert("Đăng xuất thành công!");
      navigate("/LoginPage");
    }
    setShowUserDropdown(false);
  };

  // Get home path based on header type
  const getHomePath = () => {
    switch (headerType) {
      case "staff":
        return "/Dashboard";
      case "admin":
        return "/Dashboard_ad";
      default:
        return "/";
    }
  };

  // Xác định navigation hiện tại dựa trên trạng thái đăng nhập và role
  const getCurrentNavigation = () => {
    if (!isLoggedIn) {
      return navigationConfig.guest; // Người dùng chưa đăng nhập chỉ xem được chức năng cơ bản
    }
    return navigationConfig[headerType] || navigationConfig.client;
  };

  const currentNav = getCurrentNavigation();
  const currentUserMenu = userMenuConfig[headerType] || userMenuConfig.client;
  const quickAction = getQuickActionButton();

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <nav
        className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
        style={{ minHeight: "70px" }}
      >
        <div className="container">
          {/* Logo */}
          <Link
            to={getHomePath()}
            className="navbar-brand d-flex align-items-center text-decoration-none"
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            <div
              className="me-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                color: "white",
                width: "42px",
                height: "42px",
                fontSize: "1rem",
                fontWeight: "700",
              }}
            >
              BS
            </div>
            <div>
              <div
                style={{
                  lineHeight: "1.1",
                  color: "#e74c3c",
                  fontWeight: "700",
                }}
              >
                BeautySpa
              </div>
              <small
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  fontWeight: "400",
                  lineHeight: "1",
                  marginTop: "-2px",
                  display: "block",
                }}
              >
                {getSubtitle()}
              </small>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Dynamic Navigation */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              {currentNav.map((navItem) => (
                <li key={navItem.path} className="nav-item">
                  <Link
                    className="nav-link px-3 py-2 rounded-pill"
                    style={getNavLinkStyles(navItem.path)}
                    to={navItem.path}
                  >
                    {navItem.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right side actions */}
            <div className="d-flex align-items-center gap-2">
              {/* Notification Button - chỉ hiển thị khi đã đăng nhập */}
              {isLoggedIn && (
                <button
                  className="btn btn-link p-2 position-relative"
                  style={{
                    color: "#6b7280",
                    fontSize: "1.2rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  title="Thông báo"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f8f9fa";
                    e.target.style.color = "#e74c3c";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#6b7280";
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                  </svg>
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{
                      fontSize: "0.6rem",
                      minWidth: "18px",
                      height: "18px",
                    }}
                  >
                    3
                  </span>
                </button>
              )}

              {/* User Account Section */}
              {isLoggedIn ? (
                <div className="dropdown position-relative" ref={dropdownRef}>
                  <button
                    className="btn d-flex align-items-center text-decoration-none p-2"
                    style={{
                      background: "transparent",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      minWidth:
                        headerType === "staff" || headerType === "admin"
                          ? "160px"
                          : "120px",
                    }}
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#e74c3c";
                      e.target.style.backgroundColor = "#fef2f2";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "32px",
                        height: "32px",
                        fontSize: "0.9rem",
                        background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      {userInfo?.fullName
                        ? userInfo.fullName.charAt(0).toUpperCase()
                        : userInfo?.name
                        ? userInfo.name.charAt(0).toUpperCase()
                        : headerType === "admin"
                        ? "A"
                        : headerType === "staff"
                        ? "S"
                        : "U"}
                    </div>
                    <div className="text-start flex-grow-1">
                      <div
                        style={{
                          color: "#2d3748",
                          fontWeight: "600",
                          lineHeight: "1.2",
                          fontSize: "0.85rem",
                        }}
                      >
                        {userInfo?.fullName ||
                          userInfo?.name ||
                          (headerType === "admin"
                            ? "Admin"
                            : headerType === "staff"
                            ? "Staff"
                            : "User")}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#6b7280",
                          lineHeight: "1.1",
                        }}
                      >
                        {userInfo?.role ||
                          (headerType === "admin"
                            ? "Quản trị viên"
                            : headerType === "staff"
                            ? "Nhân viên"
                            : "Khách hàng")}
                      </div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      style={{
                        color: "#6b7280",
                        transform: showUserDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                  </button>

                  {/* Dynamic User Dropdown Menu */}
                  {showUserDropdown && (
                    <div
                      className="position-absolute"
                      style={{
                        right: "0",
                        left: "auto",
                        top: "100%",
                        minWidth:
                          headerType === "staff" || headerType === "admin"
                            ? "280px"
                            : "250px",
                        marginTop: "8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        boxShadow:
                          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        backgroundColor: "white",
                        zIndex: 1000,
                        overflow: "hidden",
                      }}
                    >
                      {/* User Info Header */}
                      <div
                        className="px-4 py-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #fef2f2, #fdf2f8)",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "48px",
                              height: "48px",
                              fontSize: "1.2rem",
                              background:
                                "linear-gradient(135deg, #e74c3c, #f39c12)",
                              color: "white",
                              fontWeight: "600",
                            }}
                          >
                            {userInfo?.fullName
                              ? userInfo.fullName.charAt(0).toUpperCase()
                              : userInfo?.name
                              ? userInfo.name.charAt(0).toUpperCase()
                              : headerType === "admin"
                              ? "A"
                              : headerType === "staff"
                              ? "S"
                              : "U"}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#2d3748",
                              }}
                            >
                              {userInfo?.fullName ||
                                userInfo?.name ||
                                (headerType === "admin"
                                  ? "Administrator"
                                  : headerType === "staff"
                                  ? "Staff User"
                                  : "Customer")}
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginBottom: "2px",
                              }}
                            >
                              {userInfo?.email ||
                                (headerType === "admin"
                                  ? "admin@beautyspa.com"
                                  : headerType === "staff"
                                  ? "staff@beautyspa.com"
                                  : "user@example.com")}
                            </div>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                backgroundColor:
                                  headerType === "admin"
                                    ? "#fef3c7"
                                    : headerType === "staff"
                                    ? "#dcfdf7"
                                    : "#e0e7ff",
                                color:
                                  headerType === "admin"
                                    ? "#92400e"
                                    : headerType === "staff"
                                    ? "#065f46"
                                    : "#3730a3",
                                borderRadius: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {userInfo?.role ||
                                (headerType === "admin"
                                  ? "Quản trị viên"
                                  : headerType === "staff"
                                  ? "Nhân viên"
                                  : "Khách hàng")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Menu Items */}
                      <div className="py-2">
                        {currentUserMenu.map((menuItem) => (
                          <button
                            key={menuItem.key}
                            className="w-100 d-flex align-items-center py-3 px-4 border-0 bg-transparent"
                            style={{
                              fontSize: "0.875rem",
                              color: "#374151",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => handleMenuClick(menuItem.key)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f8f9fa";
                              e.target.style.color = "#e74c3c";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#374151";
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                              className="me-3"
                            >
                              <path d={menuItem.icon} />
                            </svg>
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                {menuItem.label}
                              </div>
                              {menuItem.description && (
                                <small style={{ color: "#9ca3af" }}>
                                  {menuItem.description}
                                </small>
                              )}
                            </div>
                          </button>
                        ))}

                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#f1f5f9",
                            margin: "8px 0",
                          }}
                        ></div>

                        <button
                          className="w-100 d-flex align-items-center py-3 px-4 border-0 bg-transparent"
                          style={{
                            fontSize: "0.875rem",
                            color: "#dc2626",
                            transition: "all 0.2s ease",
                          }}
                          onClick={handleLogout}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#fef2f2";
                            e.target.style.color = "#b91c1c";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#dc2626";
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="me-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                            />
                            <path
                              fillRule="evenodd"
                              d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                            />
                          </svg>
                          <div>
                            <div style={{ fontWeight: "500" }}>Đăng xuất</div>
                            <small style={{ color: "#f87171" }}>
                              Thoát khỏi hệ thống
                            </small>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest Login Button - Redesigned */
                <button
                  className="btn d-flex align-items-center text-decoration-none px-4 py-2"
                  style={{
                    background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                    minWidth: "140px",
                  }}
                  onClick={() => navigate("/LoginPage")}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(231, 76, 60, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(231, 76, 60, 0.3)";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                    />
                  </svg>
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeChangePasswordModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{ borderRadius: "16px", border: "none" }}
            >
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <h5 className="modal-title d-flex align-items-center">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-2"
                    style={{ color: "#e74c3c" }}
                  >
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  Đổi mật khẩu
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeChangePasswordModal}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn flex-1"
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                      onClick={closeChangePasswordModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn flex-1"
                      style={{
                        background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeSettingsModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{ borderRadius: "16px", border: "none" }}
            >
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <h5 className="modal-title d-flex align-items-center">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-2"
                    style={{ color: "#e74c3c" }}
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                  </svg>
                  Cài đặt tài khoản
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeSettingsModal}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSettingsUpdate}>
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Giao diện
                    </label>
                    <select
                      className="form-select"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      value={settingsForm.theme}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          theme: e.target.value,
                        })
                      }
                    >
                      <option value="light">Sáng</option>
                      <option value="dark">Tối</option>
                      <option value="auto">Tự động</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Ngôn ngữ
                    </label>
                    <select
                      className="form-select"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                      value={settingsForm.language}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          language: e.target.value,
                        })
                      }
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label" style={{ fontWeight: "600" }}>
                      Thông báo
                    </label>
                    <div
                      className="border rounded-3 p-3"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settingsForm.notifications.email}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              notifications: {
                                ...settingsForm.notifications,
                                email: e.target.checked,
                              },
                            })
                          }
                        />
                        <label className="form-check-label">
                          Thông báo Email
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settingsForm.notifications.push}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              notifications: {
                                ...settingsForm.notifications,
                                push: e.target.checked,
                              },
                            })
                          }
                        />
                        <label className="form-check-label">
                          Thông báo đẩy
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settingsForm.notifications.sms}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              notifications: {
                                ...settingsForm.notifications,
                                sms: e.target.checked,
                              },
                            })
                          }
                        />
                        <label className="form-check-label">
                          Thông báo SMS
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn flex-1"
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                      onClick={closeSettingsModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn flex-1"
                      style={{
                        background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      Lưu cài đặt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeProfileModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{ borderRadius: "16px", border: "none" }}
            >
              <div
                className="modal-header"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <h5 className="modal-title d-flex align-items-center">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-2"
                    style={{ color: "#e74c3c" }}
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                  </svg>
                  Thông tin cá nhân
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeProfileModal}
                ></button>
              </div>

              <div className="modal-body">
                {/* Avatar Section */}
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      fontSize: "2rem",
                      background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    {profileForm.fullName
                      ? profileForm.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <h6
                    className="mb-1"
                    style={{ color: "#2d3748", fontWeight: "600" }}
                  >
                    {profileForm.fullName || "Người dùng"}
                  </h6>
                  <small style={{ color: "#6b7280" }}>
                    {userInfo?.role || "Khách hàng"}
                  </small>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Họ và tên <span style={{ color: "#e74c3c" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Email <span style={{ color: "#e74c3c" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.birthDate}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            birthDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Giới tính
                      </label>
                      <select
                        className="form-select"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "600" }}
                      >
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  {/* Account Info Section */}
                  <div className="border-top pt-3 mt-3">
                    <h6
                      style={{
                        color: "#2d3748",
                        fontWeight: "600",
                        marginBottom: "12px",
                      }}
                    >
                      Thông tin tài khoản
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#6b7280" }}
                        >
                          Vai trò
                        </label>
                        <div
                          className="form-control d-flex align-items-center"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#f8f9fa",
                            cursor: "not-allowed",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "0.875rem",
                              padding: "4px 12px",
                              backgroundColor:
                                headerType === "admin"
                                  ? "#fef3c7"
                                  : headerType === "staff"
                                  ? "#dcfdf7"
                                  : "#e0e7ff",
                              color:
                                headerType === "admin"
                                  ? "#92400e"
                                  : headerType === "staff"
                                  ? "#065f46"
                                  : "#3730a3",
                              borderRadius: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {userInfo?.role || "Khách hàng"}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label
                          className="form-label"
                          style={{ fontWeight: "600", color: "#6b7280" }}
                        >
                          Ngày tham gia
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#f8f9fa",
                            cursor: "not-allowed",
                          }}
                          value={
                            userInfo?.joinDate ||
                            new Date().toLocaleDateString("vi-VN")
                          }
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="button"
                      className="btn flex-1"
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}
                      onClick={closeProfileModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn flex-1"
                      style={{
                        background: "linear-gradient(135deg, #e74c3c, #f39c12)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      Cập nhật thông tin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default Header;
