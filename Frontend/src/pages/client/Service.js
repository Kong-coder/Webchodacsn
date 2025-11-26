import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Star, Clock, Filter, Search, Grid, List, ChevronDown, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { getCategoryName, getCategoryIcon } from '../../utils/categoryMapper';

const ModernServiceLayout = () => {
  const [allServices, setAllServices] = useState([]);
  const [allCombos, setAllCombos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'combos'
  const servicesPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const [servicesRes, combosRes] = await Promise.all([
          fetch("/api/dich-vu?onlyAvailable=true", { headers }),
          fetch("/api/combos?status=active", { headers })
        ]);
        
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        
        // Map backend Vietnamese fields to frontend English fields
        const mappedServices = (servicesData || []).map(service => ({
          id: service.id,
          name: service.ten,
          description: service.moTa,
          duration: service.thoiLuongPhut,
          price: service.gia || 0,
          status: service.coSan ? 'active' : 'inactive',
          image: service.hinhAnh,
          category: service.loai,
          discount: 0,  // Default value
          reviews: 0    // Default value
        }));
        
        setAllServices(mappedServices);
        
        // Fetch combos
        if (combosRes.ok) {
          const combosData = await combosRes.json();
          const mappedCombos = (combosData || []).map(combo => ({
            id: combo.id,
            name: combo.tenCombo,
            description: combo.moTa,
            price: Number(combo.gia) || 0,
            discount: Number(combo.giamGia) || 0,
            status: combo.trangThai === 'ACTIVE' ? 'active' : 'inactive',
            services: combo.dichVuIds || [],
            dichVus: combo.dichVus || []
          }));
          setAllCombos(mappedCombos);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAllServices([]);
        setAllCombos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => {
    const serviceCategories = allServices.reduce((acc, service) => {
        if (service.category) {
            acc[service.category] = (acc[service.category] || 0) + 1;
        }
        return acc;
    }, {});

    const categoryList = Object.entries(serviceCategories).map(([key, count]) => ({ 
      id: key, 
      name: getCategoryName(key),  // Use Vietnamese name
      count, 
      icon: getCategoryIcon(key)   // Use category icon
    }));
    
    return [
        { id: 'all', name: 'Tất cả dịch vụ', count: allServices.length, icon: '✨' },
        ...categoryList
    ];
  }, [allServices]);

  const filteredServices = useMemo(() => 
    selectedCategory === 'all' 
      ? allServices 
      : allServices.filter(service => service.category === selectedCategory)
  , [allServices, selectedCategory]);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const currentServices = filteredServices.slice(startIndex, startIndex + servicesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    if (totalPages <= 1) return null;

    buttons.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button className="page-link rounded-pill me-1" onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}>&lsaquo;</button>
      </li>
    );

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      buttons.push(<li key={1} className="page-item"><button className="page-link rounded-pill mx-1" onClick={() => handlePageChange(1)}>1</button></li>);
      if (start > 2) buttons.push(<li key="dots1" className="page-item disabled"><span className="page-link border-0 bg-transparent mx-1">...</span></li>);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link rounded-pill mx-1" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) buttons.push(<li key="dots2" className="page-item disabled"><span className="page-link border-0 bg-transparent mx-1">...</span></li>);
      buttons.push(<li key={totalPages} className="page-item"><button className="page-link rounded-pill mx-1" onClick={() => handlePageChange(totalPages)}>{totalPages}</button></li>);
    }

    buttons.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button className="page-link rounded-pill ms-1" onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}>&rsaquo;</button>
      </li>
    );
    return buttons;
  };

  const renderStars = (rating = 4.5) => Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className={i < Math.floor(rating) ? "text-warning" : "text-muted"} fill={i < Math.floor(rating) ? "currentColor" : "none"}/>);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-xl-3 col-lg-4">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-0 py-4"><h5 className="fw-bold mb-0">Danh mục dịch vụ</h5></div>
              <div className="card-body px-0 py-2">
                {categories.map(category => (
                  <button key={category.id} className={`btn text-start w-100 d-flex align-items-center justify-content-between px-4 py-3 ${selectedCategory === category.id ? 'bg-primary bg-opacity-10 text-primary fw-bold' : 'text-dark'}`} style={{ border: 'none' }} onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}>
                    <div className="d-flex align-items-center">
                      <span className="me-3" style={{ fontSize: '20px' }}>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <span className="badge bg-light text-dark rounded-pill">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-xl-9 col-lg-8">
            {/* Tab Navigation */}
            <div className="mb-4">
              <ul className="nav nav-pills nav-fill bg-white rounded-3 shadow-sm p-2">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'services' ? 'active' : ''}`} style={{ borderRadius: '8px' }} onClick={() => { setActiveTab('services'); setCurrentPage(1); }}>
                    <span className="me-2">💆</span> Dịch Vụ ({allServices.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'combos' ? 'active' : ''}`} style={{ borderRadius: '8px' }} onClick={() => { setActiveTab('combos'); setCurrentPage(1); }}>
                    <span className="me-2">🎁</span> Gói Combo ({allCombos.length})
                  </button>
                </li>
              </ul>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 bg-white rounded-3 shadow-sm">
              <div>
                <h4 className="mb-1 fw-bold">
                  {activeTab === 'services' ? `Tìm thấy ${filteredServices.length} dịch vụ` : `Tìm thấy ${allCombos.length} gói combo`}
                </h4>
                <p className="text-muted mb-0 small">
                  {activeTab === 'services' 
                    ? (selectedCategory === 'all' ? 'Hiển thị tất cả dịch vụ có sẵn' : `Danh mục: ${categories.find(c => c.id === selectedCategory)?.name}`)
                    : 'Các gói combo ưu đãi đặc biệt'}
                </p>
              </div>
              {activeTab === 'services' && (
                <div className="d-flex align-items-center gap-3">
                  <div className="btn-group">
                    <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('grid')}><Grid size={16} /></button>
                    <button className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('list')}><List size={16} /></button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>
            ) : activeTab === 'combos' ? (
                <>
                    <div className="row g-4">
                    {allCombos.map(combo => (
                        <div key={combo.id} className="col-lg-6">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h5 className="card-title fw-bold mb-0" style={{ color: '#2d3748' }}>{combo.name}</h5>
                                    {combo.discount > 0 && <span className="badge bg-success px-3 py-2 rounded-pill">Giảm {combo.discount}%</span>}
                                </div>
                                <p className="card-text text-muted mb-3">{combo.description || 'Gói combo đặc biệt'}</p>
                                
                                <div className="mb-3">
                                    <h6 className="fw-semibold mb-2 small text-muted">Bao gồm các dịch vụ:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {(combo.dichVus || []).map((dv, i) => (
                                            <span key={i} className="badge bg-light text-dark border px-3 py-2">
                                                {dv.ten || dv.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                                    <span className="h4 fw-bold mb-0 text-success">{combo.price.toLocaleString('vi-VN')}đ</span>
                                    <Link to={`/BookingPage?comboId=${combo.id}`} className="btn btn-success px-4 py-2 rounded-pill fw-medium">Đặt combo ngay</Link>
                                </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                    {allCombos.length === 0 && (
                        <div className="text-center py-5">
                            <p className="text-muted">Hiện chưa có gói combo nào</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className={viewMode === 'grid' ? 'row g-4' : ''}>
                    {currentServices.map(service => (
                        <div key={service.id} className={viewMode === 'grid' ? 'col-lg-6 col-xl-4' : 'mb-4'}>
                        <div className={`card h-100 border-0 shadow-sm ${viewMode === 'list' ? 'card-horizontal' : ''}`} style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className={`position-relative ${viewMode === 'list' ? 'd-flex' : ''}`}>
                            <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'card-img-top'}`} style={{ height: viewMode === 'list' ? '150px' : '200px', width: viewMode === 'list' ? '200px' : 'auto', backgroundImage: `url(${service.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=250&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                {service.discount > 0 && <div className="position-absolute top-0 start-0 p-3"><span className="badge bg-danger text-white px-3 py-2 rounded-pill">-{service.discount}%</span></div>}
                            </div>
                            <div className={`card-body ${viewMode === 'list' ? 'flex-grow-1' : ''} p-4`}>
                                <h5 className="card-title fw-bold mb-2" style={{ color: '#2d3748' }}>{service.name}</h5>
                                <p className="card-text text-muted mb-3 small">{service.description}</p>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="d-flex align-items-center me-3">{renderStars(4.5)}<span className="ms-2 small text-muted fw-medium">({service.reviews || 0} đánh giá)</span></div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center text-muted"><Clock size={16} className="me-2" /><span className="fw-medium">{service.duration} phút</span></div>
                                    <span className="h5 fw-bold mb-0 text-primary">{service.price.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <Link to={`/BookingPage?serviceId=${service.id}`} className="btn btn-primary px-4 py-2 rounded-pill fw-medium w-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>Đặt lịch ngay</Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>

                    {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <nav><ul className="pagination pagination-lg">{renderPaginationButtons()}</ul></nav>
                    </div>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernServiceLayout;
