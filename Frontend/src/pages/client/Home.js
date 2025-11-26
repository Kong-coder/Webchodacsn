import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ happyClients: '0', averageRating: '0', proServices: '0' });
  const [testimonial, setTestimonial] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/dich-vu?onlyAvailable=true");
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        
        // Map backend Vietnamese fields to frontend English fields
        const mappedServices = (data || []).map(service => ({
          id: service.id,
          name: service.ten,
          description: service.moTa,
          duration: service.thoiLuongPhut,
          price: service.gia || 0,
          status: service.coSan ? 'active' : 'inactive',
          image: service.hinhAnh,
          category: service.loai,
          discount: 0  // Default value
        }));
        
        // Display first 6 services as featured
        setServices(mappedServices.slice(0, 6));
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]); // Set empty array on error
      }
    };

    const fetchStats = async () => {
      // TODO: Implement this API endpoint in backend
      // try {
      //   const response = await fetch("/api/dashboard/home-stats");
      //   if (!response.ok) {
      //     throw new Error('Failed to fetch stats');
      //   }
      //   const data = await response.json();
      //   setStats(data);
      // } catch (error) {
      //   console.error("Error fetching stats:", error);
      // }
    };

    const fetchTestimonial = async () => {
      // TODO: Implement this API endpoint in backend
      // try {
      //   const response = await fetch("/api/danh-gia/featured");
      //   if (!response.ok) {
      //     throw new Error('Failed to fetch testimonial');
      //   }
      //   const data = await response.json();
      //   setTestimonial(data);
      // } catch (error) {
      //   console.error("Error fetching testimonial:", error);
      // }
    };

    fetchServices();
    // fetchStats(); // Commented out - API not implemented yet
    // fetchTestimonial(); // Commented out - API not implemented yet
  }, []);

  return (
    <div>
      {/* Bootstrap CSS CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
        }
        
        :root {
          --primary-pink: #e91e63;
          --light-pink: #fce4ec;
          --dark-gray: #333333;
          --light-gray: #666666;
        }
        
        .navbar {
          background: white !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 1rem 0;
        }
        
        .navbar-brand {
          font-weight: 700;
          font-size: 1.8rem;
          color: var(--primary-pink) !important;
          display: flex;
          align-items: center;
        }
        
        .navbar-nav .nav-link {
          color: #333 !important;
          font-weight: 500;
          margin: 0 1rem;
          transition: color 0.3s ease;
        }
        
        .navbar-nav .nav-link:hover,
        .navbar-nav .nav-link.active {
          color: var(--primary-pink) !important;
        }
        
        .navbar-nav .dropdown-menu {
          border: none;
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
          border-radius: 10px;
        }
        
        .hero-section {
          background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #e1bee7 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero-content h1 {
          font-size: 4rem;
          font-weight: 700;
          color: var(--dark-gray);
          line-height: 1.1;
          margin-bottom: 2rem;
        }
        
        .hero-content .highlight {
          color: var(--primary-pink);
        }
        
        .hero-content p {
          font-size: 1.2rem;
          color: var(--light-gray);
          margin-bottom: 3rem;
          line-height: 1.8;
        }
        
        .btn-hero-primary {
          background: var(--primary-pink);
          color: white;
          border: none;
          padding: 15px 35px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          margin-right: 1rem;
          transition: all 0.3s ease;
        }
        
        .btn-hero-primary:hover {
          background: #c2185b;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(233, 30, 99, 0.3);
        }
        
        .btn-hero-outline {
          background: transparent;
          color: var(--primary-pink);
          border: 2px solid var(--primary-pink);
          padding: 13px 35px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .btn-hero-outline:hover {
          background: var(--primary-pink);
          color: white;
        }
        
        .hero-image {
          position: relative;
          z-index: 2;
        }
        
        .hero-image img {
          width: 100%;
          height: auto;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        
        .services-section {
          padding: 100px 0;
          background: #f8f9fa;
        }
        
        .section-title {
          font-size: 3rem;
          font-weight: 700;
          text-align: center;
          color: var(--dark-gray);
          margin-bottom: 1rem;
        }
        
        .section-title .highlight {
          color: var(--primary-pink);
        }
        
        .section-subtitle {
          font-size: 1.1rem;
          color: var(--light-gray);
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .service-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          height: 100%;
          position: relative;
        }
        
        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        
        .service-image {
          position: relative;
          overflow: hidden;
        }
        
        .service-image img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .service-card:hover .service-image img {
          transform: scale(1.1);
        }
        
        .service-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          z-index: 3;
        }
        
        .badge-popular {
          background: var(--primary-pink);
          color: white;
        }
        
        .badge-hot {
          background: #ff5722;
          color: white;
        }
        
        .service-discount {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #4caf50;
          color: white;
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          z-index: 3;
        }
        
        .service-content {
          padding: 25px;
        }
        
        .service-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--dark-gray);
          margin-bottom: 10px;
        }
        
        .service-description {
          color: var(--light-gray);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .service-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .price-current {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-pink);
        }
        
        .price-original {
          font-size: 0.9rem;
          color: #999;
          text-decoration: line-through;
          margin-left: 8px;
        }
        
        .service-rating {
          color: #ffc107;
          font-size: 0.9rem;
        }
        
        .btn-book {
          width: 100%;
          background: var(--primary-pink);
          color: white;
          border: none;
          padding: 12px 0;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-book:hover {
          background: #c2185b;
          transform: translateY(-2px);
        }
        
        .view-all-btn {
          background: transparent;
          color: var(--primary-pink);
          border: 2px solid var(--primary-pink);
          padding: 12px 40px;
          border-radius: 50px;
          font-weight: 600;
          margin-top: 3rem;
          transition: all 0.3s ease;
        }
        
        .view-all-btn:hover {
          background: var(--primary-pink);
          color: white;
        }
        
        .why-choose-section {
          padding: 100px 0;
          background: var(--light-pink);
        }
        
        .feature-card {
          background: white;
          padding: 40px 30px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
          height: 100%;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
        }
        
        .feature-icon {
          font-size: 3.5rem;
          margin-bottom: 20px;
          display: block;
        }
        
        .feature-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--dark-gray);
          margin-bottom: 15px;
        }
        
        .feature-description {
          color: var(--light-gray);
          line-height: 1.6;
        }
        
        .stats-section {
          background: linear-gradient(135deg, var(--primary-pink) 0%, #9c27b0 100%);
          color: white;
          padding: 80px 0;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-number {
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 10px;
          display: block;
        }
        
        .stat-label {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        
        .testimonial-section {
          padding: 100px 0;
          background: #f8f9fa;
        }
        
        .testimonial-card {
          background: white;
          padding: 50px 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }
        
        .testimonial-stars {
          color: #ffc107;
          font-size: 1.5rem;
          margin-bottom: 25px;
        }
        
        .testimonial-quote {
          font-size: 1.3rem;
          font-style: italic;
          color: var(--dark-gray);
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .author-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .author-info h6 {
          font-weight: 700;
          color: var(--dark-gray);
          margin-bottom: 2px;
        }
        
        .author-info small {
          color: var(--light-gray);
        }
        
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .hero-content .btn-hero-primary,
          .hero-content .btn-hero-outline {
            display: block;
            width: 100%;
            margin: 0.5rem 0;
          }
        }
      `}</style>
      {/* <Header/> */}

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1>
                  Trải nghiệm <span className="highlight">làm đẹp</span>
                  <br />
                  đẳng cấp
                </h1>
                <p>
                  Khám phá không gian thư giãn tuyệt vời với các dịch vụ chăm
                  sóc sắc đẹp chuyên nghiệp, được thực hiện bởi đội ngũ chuyên
                  viên giàu kinh nghiệm.
                </p>
                <div>
                  {/* Lien ket voi trang dat lich(BookingPage) */}
                  {/* <button className="btn-hero-primary">Đặt lịch ngay</button> */}
                  <Link to="/BookingPage" className="btn-hero-primary">
                    Đặt lịch ngay
                  </Link>

                  {/* <button className="btn-hero-outline">Xem dịch vụ</button> */}
                  {/* Lien ket voi trang dich vu(Services) */}
                  <Link to="/Service" className="btn-hero-outline">
                    Xem dịch vụ
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600"
                  alt="Beauty Spa Interior"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">
            Dịch vụ <span className="highlight">nổi bật</span>
          </h2>
          <p className="section-subtitle">
            Những dịch vụ chăm sóc làm đẹp chuyên nghiệp được yêu thích nhất tại
            Beauty Spa
          </p>

          <div className="row g-4">
            {services.map((service) => (
              <div key={service.id} className="col-lg-4 col-md-6">
                <div className="service-card">
                  <div className="service-image">
                    <img src={service.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'} alt={service.name} />

                    {service.discount > 0 && (
                      <div className="service-discount">
                        -{service.discount}%
                      </div>
                    )}
                  </div>

                  <div className="service-content">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-description">{service.description}</p>

                    <div className="service-price-row">
                      <div>
                        <span className="price-current">{service.price.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="service-rating">★★★★★</div>
                    </div>

                    <Link to={`/BookingPage?serviceId=${service.id}`} className="btn-book">Đặt lịch ngay</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="view-all-btn">Xem tất cả dịch vụ</button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="why-choose-section">
        <div className="container">
          <h2 className="section-title">
            Tại sao chọn <span className="highlight">chúng tôi?</span>
          </h2>
          <p className="section-subtitle">
            Những lý do khiến hàng nghìn khách hàng tin tướng và lựa chọn Beauty
            Spa
          </p>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">🛡️</span>
                <h4 className="feature-title">An toàn & Vệ sinh</h4>
                <p className="feature-description">
                  Tuân thủ nghiêm ngặt các tiêu chuẩn vệ sinh
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">👥</span>
                <h4 className="feature-title">Chuyên viên giàu kinh nghiệm</h4>
                <p className="feature-description">
                  Đội ngũ chuyên viên được đào tạo bài bản
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">❤️</span>
                <h4 className="feature-title">Chăm sóc tận tâm</h4>
                <p className="feature-description">
                  Luôn đặt khách hàng lên hàng đầu
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">⚡</span>
                <h4 className="feature-title">Sản phẩm chất lượng cao</h4>
                <p className="feature-description">
                  Sử dụng các sản phẩm nhập khẩu cao cấp từ các thương hiệu uy
                  tín
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">📞</span>
                <h4 className="feature-title">Linh hoạt thời gian</h4>
                <p className="feature-description">
                  Phục vụ 7 ngày trong tuần từ 8h đến 22h mỗi ngày với lịch hẹn
                  linh hoạt
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <span className="feature-icon">⭐</span>
                <h4 className="feature-title">Cam kết 24/7</h4>
                <p className="feature-description">
                  Hỗ trợ khách hàng mọi lúc mọi nơi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="stat-item">
                <span className="stat-number">{stats.happyClients}</span>
                <div className="stat-label">Khách hàng hài lòng</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <span className="stat-number">{stats.averageRating}</span>
                <div className="stat-label">Đánh giá trung bình</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <span className="stat-number">{stats.proServices}</span>
                <div className="stat-label">Dịch vụ chuyên nghiệp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonial && (
        <section className="testimonial-section">
          <div className="container">
            <h2 className="section-title">
              Khách hàng <span className="highlight">nói gì</span>
            </h2>
            <p className="section-subtitle">
              Những phản hồi chân thật từ khách hàng đã trải nghiệm dịch vụ tại
              Beauty Spa
            </p>

            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="testimonial-card">
                  <div className="testimonial-stars">{'★'.repeat(testimonial.diem)}</div>
                  <blockquote className="testimonial-quote">
                    "{testimonial.noiDung}"
                  </blockquote>
                  <div className="testimonial-author">
                    <img
                      src={testimonial.avatarNguoiDung || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                      alt={testimonial.tenNguoiDung}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <h6>{testimonial.tenNguoiDung}</h6>
                      <small>Khách hàng thân thiết</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    

      {/* Bootstrap JS CDN */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}

export default Home;
