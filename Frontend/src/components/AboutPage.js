import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { showToast } from './Toast';
import { showConfirm } from './ConfirmModal';

const AboutPage = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    customers: 0,
    services: 0,
    experience: 0,
    satisfaction: 0
  });

  const handleBookingClick = async () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!token) {
      const confirmLogin = await showConfirm('Bạn cần đăng nhập để đặt lịch. Bạn có muốn chuyển đến trang đăng nhập không?', 'Yêu cầu đăng nhập');
      if (confirmLogin) {
        navigate('/LoginPage', { state: { from: '/BookingPage' } });
      }
    } else {
      navigate('/BookingPage');
    }
  };

  useEffect(() => {
    const animateCounters = () => {
      const targets = { customers: 5000, services: 150, experience: 10, satisfaction: 98 };
      const duration = 2000;
      const steps = 60;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounters({
          customers: Math.floor(targets.customers * progress),
          services: Math.floor(targets.services * progress),
          experience: Math.floor(targets.experience * progress),
          satisfaction: Math.floor(targets.satisfaction * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, duration / steps);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      

      {/* Hero Section - Clean & Minimal */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid px-4 py-5">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '50px',
              alignItems: 'center',
              maxWidth: '1400px',
              margin: '0 auto'
            }}
          >
            {/* Content */}
            <div>
              <div className="mb-4">
                <span 
                  className="badge px-3 py-2 mb-3"
                  style={{ 
                    backgroundColor: '#e91e63', 
                    color: 'white',
                    fontSize: '0.9rem',
                    borderRadius: '25px'
                  }}
                >
                  About BeautySpa
                </span>
              </div>
              <h1 className="display-4 fw-bold mb-4" style={{ color: '#2d3748' }}>
                Nơi vẻ đẹp 
                <span style={{ color: '#e91e63' }}> được tôn vinh</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ lineHeight: '1.7' }}>
                Chúng tôi là trung tâm làm đẹp hàng đầu với sứ mệnh mang đến vẻ đẹp tự nhiên 
                và sự tự tin cho mọi khách hàng thông qua dịch vụ chuyên nghiệp.
              </p>
              <div className="d-flex gap-3 mb-5">
                <button 
                  className="btn btn-lg px-4 py-3 fw-semibold text-white border-0"
                  style={{ backgroundColor: '#e91e63', borderRadius: '12px' }}
                  onClick={handleBookingClick}
                >
                  Đặt lịch ngay
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg px-4 py-3"
                  style={{ borderRadius: '12px' }}
                  onClick={() => navigate('/Service')}
                >
                  Tìm hiểu thêm
                </button>
              </div>

              {/* Quick Stats */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '30px',
                  paddingTop: '20px'
                }}
              >
                <div className="text-center">
                  <div className="h3 fw-bold mb-1" style={{ color: '#e91e63' }}>5K+</div>
                  <small className="text-muted">Khách hàng</small>
                </div>
                <div className="text-center">
                  <div className="h3 fw-bold mb-1" style={{ color: '#9c27b0' }}>98%</div>
                  <small className="text-muted">Hài lòng</small>
                </div>
                <div className="text-center">
                  <div className="h3 fw-bold mb-1" style={{ color: '#e91e63' }}>10+</div>
                  <small className="text-muted">Năm kinh nghiệm</small>
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(3, 180px)',
                gap: '20px'
              }}
            >
              <div 
                className="rounded-4 shadow-sm"
                style={{
                  gridColumn: '1',
                  gridRow: '1 / 3',
                  background: 'url(https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop) center/cover'
                }}
              ></div>
              <div 
                className="rounded-4 shadow-sm"
                style={{
                  gridColumn: '2',
                  gridRow: '1',
                  background: 'url(https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop) center/cover'
                }}
              ></div>
              <div 
                className="rounded-4 shadow-sm"
                style={{
                  gridColumn: '2',
                  gridRow: '2 / 4',
                  background: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop) center/cover'
                }}
              ></div>
              <div 
                className="rounded-4 shadow-sm"
                style={{
                  gridColumn: '1',
                  gridRow: '3',
                  background: 'url(https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&h=200&fit=crop) center/cover'
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h2 className="h1 fw-bold mb-4" style={{ color: '#2d3748' }}>
                Câu chuyện của chúng tôi
              </h2>
              <p className="mb-4 text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                BeautySpa được thành lập với niềm đam mê mang đến những trải nghiệm làm đẹp 
                tuyệt vời nhất cho khách hàng. Chúng tôi tin rằng vẻ đẹp không chỉ là ngoại hình 
                mà còn là sự tự tin và hạnh phúc từ bên trong.
              </p>
              <p className="mb-4 text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                Với đội ngũ chuyên gia giàu kinh nghiệm và trang thiết bị hiện đại, chúng tôi 
                cam kết cung cấp những dịch vụ chất lượng cao nhất.
              </p>
              
              <div className="row mt-5">
                <div className="col-6">
                  <div className="p-4 bg-light rounded-4 text-center">
                    <h4 className="fw-bold mb-2" style={{ color: '#e91e63' }}>ISO 9001</h4>
                    <small className="text-muted">Chứng nhận chất lượng quốc tế</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-light rounded-4 text-center">
                    <h4 className="fw-bold mb-2" style={{ color: '#9c27b0' }}>100%</h4>
                    <small className="text-muted">Sản phẩm tự nhiên an toàn</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&h=500&fit=crop"
                alt="BeautySpa Interior"
                className="img-fluid rounded-4 shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h1 fw-bold mb-3" style={{ color: '#2d3748' }}>
              Dịch vụ chuyên nghiệp
            </h2>
            <p className="lead text-muted">Trải nghiệm đa dạng các liệu pháp làm đẹp hàng đầu</p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}
          >
            {/* Service 1 */}
            <div 
              className="bg-white rounded-4 overflow-hidden shadow-sm h-100"
              style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
              }}
            >
              <div 
                className="position-relative"
                style={{
                  height: '250px',
                  background: 'url(https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=300&fit=crop) center/cover'
                }}
              >
                <div 
                  className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white fw-semibold"
                  style={{ backgroundColor: '#e91e63', fontSize: '0.85rem' }}
                >
                  Skincare
                </div>
              </div>
              <div className="p-4">
                <h4 className="fw-bold mb-3" style={{ color: '#2d3748' }}>
                  Chăm sóc da chuyên sâu
                </h4>
                <p className="text-muted mb-4">
                  Liệu pháp chăm sóc da với công nghệ hiện đại và sản phẩm cao cấp 
                  giúp phục hồi và duy trì làn da khỏe mạnh.
                </p>
                <button 
                  className="btn fw-semibold"
                  style={{ color: '#e91e63', backgroundColor: 'transparent', border: 'none' }}
                >
                  Tìm hiểu thêm →
                </button>
              </div>
            </div>

            {/* Service 2 */}
            <div 
              className="bg-white rounded-4 overflow-hidden shadow-sm h-100"
              style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
              }}
            >
              <div 
                className="position-relative"
                style={{
                  height: '250px',
                  background: 'url(https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=300&fit=crop) center/cover'
                }}
              >
                <div 
                  className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white fw-semibold"
                  style={{ backgroundColor: '#9c27b0', fontSize: '0.85rem' }}
                >
                  Wellness
                </div>
              </div>
              <div className="p-4">
                <h4 className="fw-bold mb-3" style={{ color: '#2d3748' }}>
                  Massage & Spa therapy
                </h4>
                <p className="text-muted mb-4">
                  Các liệu pháp massage và spa giúp thư giãn toàn diện cho cơ thể 
                  và tinh thần, mang lại cảm giác sảng khoái tuyệt vời.
                </p>
                <button 
                  className="btn fw-semibold"
                  style={{ color: '#9c27b0', backgroundColor: 'transparent', border: 'none' }}
                >
                  Tìm hiểu thêm →
                </button>
              </div>
            </div>

            {/* Service 3 */}
            <div 
              className="bg-white rounded-4 overflow-hidden shadow-sm h-100"
              style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
              }}
            >
              <div 
                className="position-relative"
                style={{
                  height: '250px',
                  background: 'url(https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&h=300&fit=crop) center/cover'
                }}
              >
                <div 
                  className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill text-white fw-semibold"
                  style={{ backgroundColor: '#e91e63', fontSize: '0.85rem' }}
                >
                  Beauty
                </div>
              </div>
              <div className="p-4">
                <h4 className="fw-bold mb-3" style={{ color: '#2d3748' }}>
                  Beauty Enhancement
                </h4>
                <p className="text-muted mb-4">
                  Dịch vụ làm nail, nối mi, trang điểm chuyên nghiệp và các liệu pháp 
                  làm đẹp toàn diện khác.
                </p>
                <button 
                  className="btn fw-semibold"
                  style={{ color: '#e91e63', backgroundColor: 'transparent', border: 'none' }}
                >
                  Tìm hiểu thêm →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h1 fw-bold mb-3" style={{ color: '#2d3748' }}>
              Đội ngũ chuyên gia
            </h2>
            <p className="lead text-muted">Những bàn tay tài hoa tạo nên sự khác biệt</p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px'
            }}
          >
            {/* Team Member 1 */}
            <div 
              className="text-center"
              style={{ transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div 
                className="rounded-4 mx-auto mb-4 shadow-sm"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'url(https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face) center/cover'
                }}
              ></div>
              <h5 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Dr. Sarah Johnson</h5>
              <p className="text-muted mb-2">Giám đốc & Chuyên gia da liễu</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge" style={{ backgroundColor: '#e91e63', color: 'white' }}>
                  15+ years
                </span>
                <span className="badge bg-light text-muted">Dermatology</span>
              </div>
              <p className="small text-muted">
                Chuyên gia hàng đầu về chăm sóc da và các liệu pháp chống lão hóa
              </p>
            </div>

            {/* Team Member 2 */}
            <div 
              className="text-center"
              style={{ transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div 
                className="rounded-4 mx-auto mb-4 shadow-sm"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'url(https://images.unsplash.com/photo-1594824884924-96a2b5e4b82b?w=300&h=300&fit=crop&crop=face) center/cover'
                }}
              ></div>
              <h5 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Emily Chen</h5>
              <p className="text-muted mb-2">Chuyên gia Massage & Spa</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge" style={{ backgroundColor: '#9c27b0', color: 'white' }}>
                  8+ years
                </span>
                <span className="badge bg-light text-muted">Massage</span>
              </div>
              <p className="small text-muted">
                Chuyên gia massage được đào tạo từ Thái Lan và Nhật Bản
              </p>
            </div>

            {/* Team Member 3 */}
            <div 
              className="text-center"
              style={{ transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div 
                className="rounded-4 mx-auto mb-4 shadow-sm"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'url(https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face) center/cover'
                }}
              ></div>
              <h5 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Maria Rodriguez</h5>
              <p className="text-muted mb-2">Nail Art & Lash Specialist</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge" style={{ backgroundColor: '#e91e63', color: 'white' }}>
                  6+ years
                </span>
                <span className="badge bg-light text-muted">Nail Art</span>
              </div>
              <p className="small text-muted">
                Nghệ sĩ nail và chuyên gia nối mi với tay nghề cao
              </p>
            </div>

            {/* Team Member 4 */}
            <div 
              className="text-center"
              style={{ transition: 'transform 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div 
                className="rounded-4 mx-auto mb-4 shadow-sm"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'url(https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=300&fit=crop&crop=face) center/cover'
                }}
              ></div>
              <h5 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Jessica Park</h5>
              <p className="text-muted mb-2">Makeup Artist</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge" style={{ backgroundColor: '#9c27b0', color: 'white' }}>
                  10+ years
                </span>
                <span className="badge bg-light text-muted">Makeup</span>
              </div>
              <p className="small text-muted">
                Chuyên gia trang điểm cô dâu và các sự kiện đặc biệt
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h1 fw-bold mb-3" style={{ color: '#2d3748' }}>
              Con số ấn tượng
            </h2>
            <p className="lead text-muted">Thành tựu chúng tôi đạt được qua nhiều năm</p>
          </div>
          
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px'
            }}
          >
            <div className="text-center">
              <div className="display-3 fw-bold mb-3" style={{ color: '#e91e63' }}>
                {counters.customers.toLocaleString()}+
              </div>
              <h5 className="text-muted">Khách hàng hài lòng</h5>
            </div>
            <div className="text-center">
              <div className="display-3 fw-bold mb-3" style={{ color: '#9c27b0' }}>
                {counters.services}+
              </div>
              <h5 className="text-muted">Dịch vụ chuyên nghiệp</h5>
            </div>
            <div className="text-center">
              <div className="display-3 fw-bold mb-3" style={{ color: '#e91e63' }}>
                {counters.experience}+
              </div>
              <h5 className="text-muted">Năm kinh nghiệm</h5>
            </div>
            <div className="text-center">
              <div className="display-3 fw-bold mb-3" style={{ color: '#9c27b0' }}>
                {counters.satisfaction}%
              </div>
              <h5 className="text-muted">Độ hài lòng</h5>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only place using gradient */}
      <section 
        className="py-5 text-white text-center"
        style={{ 
          background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
          position: 'relative'
        }}
      >
        <div className="container py-5">
          <h2 className="display-4 fw-bold mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="lead mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Hãy để chúng tôi giúp bạn khám phá vẻ đẹp tự nhiên và tìm lại sự tự tin hoàn hảo
          </p>
          <div className="d-flex justify-content-center gap-4">
            <button 
              className="btn btn-light btn-lg px-5 py-3 fw-semibold"
              style={{ borderRadius: '12px' }}
              onClick={handleBookingClick}
            >
              Đặt lịch hẹn ngay
            </button>
            <button 
              className="btn btn-outline-light btn-lg px-5 py-3"
              style={{ borderRadius: '12px' }}
              onClick={() => navigate('/Service')}
            >
              Tư vấn miễn phí
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};

export default AboutPage;