import React from 'react';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
const Footer = () => {
  return (
    <footer className="bg-white shadow-lg" style={{ borderRadius: '25px 25px 0 0' }}>
      <div className="container py-5">
        <div className="row">
          {/* BeautySpa Info */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-4">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #e91e63, #ad1457)',
                  fontSize: '20px'
                }}
              >
                BS
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: '#e91e63' }}>BeautySpa</h4>
                <small className="text-muted">Luxury & Wellness</small>
              </div>
            </div>
            <p className="text-muted mb-4 lh-base">
              Trung tâm làm đẹp chuyên nghiệp với đội ngũ chuyên viên giàu kinh nghiệm, 
              mang đến những trải nghiệm làm đẹp tuyệt vời nhất.
            </p>
          </div>

          {/* Dịch vụ */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h5 className="fw-bold mb-4" style={{ color: '#e91e63' }}>Dịch vụ</h5>
            <ul className="list-unstyled">
              {[
                'Chăm sóc da mặt',
                'Massage thư giãn',
                'Làm móng nghệ thuật',
                'Trang điểm cô dâu',
                'Trị liệu collagen',
                'Waxing toàn thân'
              ].map((service, index) => (
                <li key={index} className="mb-2">
                  <a 
                    href="#" 
                    className="text-muted text-decoration-none"
                    style={{ transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#e91e63'}
                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên kết */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h5 className="fw-bold mb-4" style={{ color: '#e91e63' }}>Liên kết</h5>
            <ul className="list-unstyled">
              {[
                'Trang chủ',
                'Dịch vụ',
                'Giới thiệu',
                'Liên hệ',
                'Tin tức',
                'Chính sách bảo mật'
              ].map((link, index) => (
                <li key={index} className="mb-2">
                  <a 
                    href="#" 
                    className="text-muted text-decoration-none"
                    style={{ transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#e91e63'}
                    onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold mb-4" style={{ color: '#e91e63' }}>Thông tin liên hệ</h5>
            <div className="mb-4">
              {[
                { 
                  icon: MapPin, 
                  text: '123 Đường ABC, Quận 1, TP.HCM',
                  color: '#e91e63'
                },
                { 
                  icon: Phone, 
                  text: '0123 456 789',
                  color: '#e91e63'
                },
                { 
                  icon: Mail, 
                  text: 'info@beautyspa.vn',
                  color: '#e91e63'
                },
                { 
                  icon: Clock, 
                  text: '8:00 - 22:00 (Thứ 2 - CN)',
                  color: '#e91e63'
                }
              ].map((contact, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <div
                    className="me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '20px',
                      height: '20px',
                      color: contact.color
                    }}
                  >
                    <contact.icon size={18} />
                  </div>
                  <span className="text-muted">{contact.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <hr className="my-4" style={{ opacity: 0.2 }} />
        <div className="text-center">
          <p className="text-muted mb-0 d-flex align-items-center justify-content-center">
            © 2024 BeautySpa. Tất cả quyền được bảo lưu. | Được thiết kế với
            <Heart size={16} className="text-danger mx-1" />
            tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;