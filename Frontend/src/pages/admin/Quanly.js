import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Badge,
  Nav,
  Tab,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/admin/Quanly.css";
import { showToast } from "../../components/Toast";
import { showConfirm } from "../../components/ConfirmModal";
import { CATEGORIES } from "../../utils/categoryMapper";

const SpaManagement = () => {
  const [services, setServices] = useState([]);
  const [combos, setCombos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  const [showComboModal, setShowComboModal] = useState(false);
  const [comboModalMode, setComboModalMode] = useState("add");
  const [currentCombo, setCurrentCombo] = useState(null);

  // Use centralized category mapping
  const categories = CATEGORIES;

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/dich-vu/stats', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      
      // Map backend Vietnamese fields to frontend English fields
      const mappedServices = (data || []).map(service => ({
        id: service.id,
        name: service.ten,
        description: service.moTa,
        duration: service.thoiLuongPhut,
        price: service.gia,
        status: service.coSan ? 'active' : 'inactive',
        image: service.hinhAnh,
        category: service.loai,
        bookings: service.bookings || 0, // From backend stats
        revenue: service.revenue || 0,   // From backend stats
        discount: 0  // Default value
      }));
      
      console.log('Services with stats:', mappedServices);
      setServices(mappedServices);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi tải danh sách dịch vụ', 'error');
    }
  }, []);

  const fetchCombos = useCallback(async () => {
    try {
      const response = await fetch('/api/combos', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch combos');
      const data = await response.json();
      
      // Map backend Vietnamese fields to frontend English fields
      const mappedCombos = (data || []).map(combo => {
        console.log('=== COMBO MAPPING DEBUG ===');
        console.log('Backend combo:', combo);
        
        const mapped = {
          id: combo.id,
          name: combo.tenCombo || '',
          description: combo.moTa || '',
          price: Number(combo.gia) || 0,  // Ensure it's a number
          discount: Number(combo.giamGia) || 0,  // Ensure it's a number
          status: combo.trangThai === 'ACTIVE' ? 'active' : 'inactive',
          services: combo.dichVuIds || [],  // Array of service IDs
          dichVus: combo.dichVus || []      // Full service objects (for display)
        };
        
        console.log('Mapped combo:', mapped);
        return mapped;
      });
      
      setCombos(mappedCombos);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi tải danh sách combo', 'error');
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCombos();
  }, [fetchServices, fetchCombos]);

  const handleShowModal = (mode, service = null) => {
    setModalMode(mode);
    setCurrentService(
      service || {
        name: "",
        image: "",
        price: 0,
        duration: 0,
        description: "",
        category: "massage",
        status: "active",
        discount: 0,
      }
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentService(null);
  };

  const handleSaveService = async () => {
    if (!currentService) return;
    const url = modalMode === 'add' ? '/api/dich-vu' : `/api/dich-vu/${currentService.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    // Map frontend fields to backend Vietnamese fields
    const requestBody = {
      tenDichVu: currentService.name,
      moTa: currentService.description,
      thoiLuongPhut: currentService.duration,
      gia: currentService.price,
      coSan: currentService.status === 'active',
      hinhAnh: currentService.image,
      loai: currentService.category
    };

    console.log('=== SAVE SERVICE DEBUG ===');
    console.log('Frontend data:', currentService);
    console.log('Backend request:', requestBody);

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error('Failed to save service');
      }
      showToast('Lưu dịch vụ thành công!', 'success');
      handleCloseModal();
      fetchServices();
    } catch (error) {
      console.error(error);
      showToast('Lưu dịch vụ thất bại', 'error');
    }
  };

  const handleDeleteService = async (id) => {
    const confirmed = await showConfirm("Bạn có chắc muốn xóa dịch vụ này?", "Xóa dịch vụ");
    if (confirmed) {
        try {
            const response = await fetch(`/api/dich-vu/${id}`, { 
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete service');
            showToast('Xóa dịch vụ thành công', 'success');
            fetchServices();
        } catch (error) {
            console.error(error);
            showToast('Xóa dịch vụ thất bại', 'error');
        }
    }
  };

  const handleShowComboModal = (mode, combo = null) => {
    setComboModalMode(mode);
    setCurrentCombo(
      combo || {
        name: "",
        services: [],
        price: 0,
        discount: 0,
        status: "active",
      }
    );
    setShowComboModal(true);
  };

  const handleCloseComboModal = () => {
    setShowComboModal(false);
    setCurrentCombo(null);
  };

  const handleSaveCombo = async () => {
    if (!currentCombo) return;
    const url = comboModalMode === 'add' ? '/api/combos' : `/api/combos/${currentCombo.id}`;
    const method = comboModalMode === 'add' ? 'POST' : 'PUT';

    // Map frontend fields to backend Vietnamese fields
    const requestBody = {
      tenCombo: currentCombo.name,
      moTa: currentCombo.description || '',
      gia: currentCombo.price,
      giamGia: currentCombo.discount || 0,
      trangThai: currentCombo.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      dichVuIds: currentCombo.services || []
    };

    console.log('=== SAVE COMBO DEBUG ===');
    console.log('Frontend data:', currentCombo);
    console.log('Backend request:', requestBody);

    try {
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error('Failed to save combo');
        }
        showToast('Lưu combo thành công!', 'success');
        handleCloseComboModal();
        fetchCombos();
    } catch (error) {
        console.error(error);
        showToast('Lưu combo thất bại', 'error');
    }
  };

  const handleDeleteCombo = async (id) => {
    const confirmed = await showConfirm("Bạn có chắc muốn xóa combo này?", "Xóa combo");
    if (confirmed) {
        try {
            const response = await fetch(`/api/combos/${id}`, { 
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete combo');
            showToast('Xóa combo thành công', 'success');
            fetchCombos();
        } catch (error) {
            console.error(error);
            showToast('Xóa combo thất bại', 'error');
        }
    }
  };

  const toggleServiceInCombo = (serviceId) => {
    if (!currentCombo) return;
    const selectedServices = currentCombo.services.includes(serviceId)
      ? currentCombo.services.filter((id) => id !== serviceId)
      : [...currentCombo.services, serviceId];
    setCurrentCombo({ ...currentCombo, services: selectedServices });
  };

  const filteredServices = services.filter((service) => {
    const matchSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" || service.category === filterCategory;
    const matchPrice =
      filterPrice === "all" ||
      (filterPrice === "low" && service.price < 300000) ||
      (filterPrice === "mid" &&
        service.price >= 300000 &&
        service.price <= 500000) ||
      (filterPrice === "high" && service.price > 500000);
    return matchSearch && matchCategory && matchPrice;
  });

  const topServices = [...services]
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);
  const totalRevenue = services.reduce(
    (sum, s) => sum + s.price * (s.bookings || 0) * (1 - (s.discount || 0) / 100),
    0
  );

  return (
    <div className="spa-container">
      <div className="spa-header">
        <Container>
          <h1 className="mb-0">🌸 Quản Lý Spa</h1>
          <p className="mb-0">Hệ thống quản lý dịch vụ chuyên nghiệp</p>
        </Container>
      </div>

      <Container className="py-4">
        <Tab.Container defaultActiveKey="services">
          <Nav variant="pills" className="mb-4 spa-nav-pills">
            <Nav.Item>
              <Nav.Link eventKey="services">📋 Danh Sách Dịch Vụ</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="combos">🎁 Quản Lý Combo</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="stats">📊 Thống Kê</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="services">
              <Card className="mb-4 spa-card">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="🔍 Tìm kiếm dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="spa-form-control"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="spa-form-select"
                      >
                        <option value="all">Tất cả loại dịch vụ</option>
                        {Object.entries(categories).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={filterPrice}
                        onChange={(e) => setFilterPrice(e.target.value)}
                        className="spa-form-select"
                      >
                        <option value="all">Tất cả mức giá</option>
                        <option value="low">Dưới 300K</option>
                        <option value="mid">300K - 500K</option>
                        <option value="high">Trên 500K</option>
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Button
                        className="btn-gradient-full"
                        onClick={() => handleShowModal("add")}
                      >
                        ➕ Thêm Mới
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Row>
                {filteredServices.map((service) => (
                  <Col md={4} key={service.id} className="mb-4">
                    <Card className="service-card">
                      <div style={{ position: "relative" }}>
                        <Card.Img
                          variant="top"
                          src={service.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                          className="service-card-img"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x250?text=Image+Error';
                          }}
                        />
                        {service.discount > 0 && (
                          <Badge className="service-discount-badge">
                            🔥 -{service.discount}%
                          </Badge>
                        )}
                        <Badge
                          bg={
                            service.status === "active"
                              ? "success"
                              : "secondary"
                          }
                          className="service-status-badge"
                        >
                          {service.status === "active"
                            ? "✓ Hoạt động"
                            : "✕ Ngưng"}
                        </Badge>
                      </div>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="service-card-title">{service.name}</h5>
                          <Badge
                            bg="light"
                            text="dark"
                            className="service-card-category"
                          >
                            {categories[service.category]}
                          </Badge>
                        </div>
                        <p className="service-card-description">
                          {service.description}
                        </p>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="service-price-label">💰 Giá:</span>
                            <span className="service-price-value">
                              {service.price.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="service-price-label">
                              ⏱️ Thời lượng:
                            </span>
                            <span>{service.duration} phút</span>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="service-button"
                            onClick={() => handleShowModal("edit", service)}
                          >
                            ✏️ Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="service-button"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            🗑️ Xóa
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="combos">
              <Card className="spa-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 style={{ fontWeight: "700" }}>🎁 Danh Sách Combo</h4>
                    <Button
                      className="btn-gradient"
                      onClick={() => handleShowComboModal("add")}
                    >
                      ➕ Tạo Combo Mới
                    </Button>
                  </div>
                  <Row>
                    {combos.map((combo) => {
                      const comboServices = services.filter((s) =>
                        (combo.services || []).includes(s.id)
                      );
                      const originalPrice = comboServices.reduce(
                        (sum, s) => sum + s.price,
                        0
                      );

                      return (
                        <Col md={6} key={combo.id} className="mb-3">
                          <Card className="combo-card">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="combo-card-title">
                                  {combo.name}
                                </h5>
                                <Badge
                                  bg={
                                    combo.status === "active"
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {combo.status === "active"
                                    ? "Hoạt động"
                                    : "Ngừng"}
                                </Badge>
                              </div>
                              <p className="combo-card-description">
                                Bao gồm {(combo.services || []).length} dịch vụ:
                              </p>
                              <ul className="combo-service-list">
                                {comboServices.map((s) => (
                                  <li key={s.id}>
                                    {s.name} - {s.price.toLocaleString("vi-VN")}
                                    đ
                                  </li>
                                ))}
                              </ul>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="combo-original-price">
                                    {originalPrice.toLocaleString("vi-VN")}đ
                                  </div>
                                  <span className="combo-final-price">
                                    {combo.price.toLocaleString("vi-VN")}đ
                                  </span>
                                  <Badge bg="danger" className="ms-2">
                                    -{combo.discount}%
                                  </Badge>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="combo-button"
                                    onClick={() =>
                                      handleShowComboModal("edit", combo)
                                    }
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="combo-button"
                                    onClick={() => handleDeleteCombo(combo.id)}
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            <Tab.Pane eventKey="stats">
              <Row>
                <Col md={4} className="mb-4">
                  <Card className="stats-card-revenue">
                    <Card.Body>
                      <h6 className="stats-card-label">💰 Tổng Doanh Thu</h6>
                      <h2 className="stats-card-value">
                        {totalRevenue.toLocaleString("vi-VN")}đ
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-4">
                  <Card className="stats-card-services">
                    <Card.Body>
                      <h6 className="stats-card-label">📋 Tổng Dịch Vụ</h6>
                      <h2 className="stats-card-value">{services.length}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-4">
                  <Card className="stats-card-bookings">
                    <Card.Body>
                      <h6 className="stats-card-label">🎯 Tổng Lượt Đặt</h6>
                      <h2 className="stats-card-value">
                        {services.reduce((sum, s) => sum + (s.bookings || 0), 0)}
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="spa-card">
                <Card.Body>
                  <h4 className="top-services-title">
                    🏆 Top Dịch Vụ Được Đặt Nhiều Nhất
                  </h4>
                  <Table hover responsive>
                    <thead className="stats-table-header">
                      <tr>
                        <th>Hạng</th>
                        <th>Tên Dịch Vụ</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Lượt Đặt</th>
                        <th>Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topServices.map((service, index) => (
                        <tr key={service.id}>
                          <td className="stats-table-rank">#{index + 1}</td>
                          <td className="stats-table-name">{service.name}</td>
                          <td>
                            <Badge bg="light" text="dark">
                              {categories[service.category]}
                            </Badge>
                          </td>
                          <td>{service.price.toLocaleString("vi-VN")}đ</td>
                          <td>
                            <Badge bg="primary">{service.bookings || 0}</Badge>
                          </td>
                          <td className="stats-table-revenue">
                            {(
                              service.price *
                              (service.bookings || 0) *
                              (1 - (service.discount || 0) / 100)
                            ).toLocaleString("vi-VN")}
                            đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      {/* Modal Add/Edit Service */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="spa-modal-header">
          <Modal.Title className="spa-modal-title">
            {modalMode === "add"
              ? "➕ Thêm Dịch Vụ Mới"
              : "✏️ Chỉnh Sửa Dịch Vụ"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentService && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Tên Dịch Vụ
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={currentService.name}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          name: e.target.value,
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Loại Dịch Vụ
                    </Form.Label>
                    <Form.Select
                      value={currentService.category}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          category: e.target.value,
                        })
                      }
                      className="spa-form-select"
                    >
                      {Object.entries(categories).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Giá (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentService.price}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          price: Number(e.target.value),
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Thời Lượng (phút)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentService.duration}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          duration: Number(e.target.value),
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Giảm Giá (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentService.discount}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          discount: Number(e.target.value),
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label">
                  Hình Ảnh Dịch Vụ
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Convert to base64 or upload to server
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCurrentService({
                          ...currentService,
                          image: reader.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="spa-form-control"
                />
                {currentService.image && (
                  <div className="mt-2">
                    <img 
                      src={currentService.image} 
                      alt="Preview" 
                      style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px'}}
                    />
                  </div>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label">Mô Tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentService.description}
                  onChange={(e) =>
                    setCurrentService({
                      ...currentService,
                      description: e.target.value,
                    })
                  }
                  className="spa-form-control"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label">Trạng Thái</Form.Label>
                <Form.Select
                  value={currentService.status}
                  onChange={(e) =>
                    setCurrentService({
                      ...currentService,
                      status: e.target.value,
                    })
                  }
                  className="spa-form-select"
                >
                  <option value="active">Đang Hoạt Động</option>
                  <option value="inactive">Ngưng Cung Cấp</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            className="spa-modal-button"
          >
            Hủy
          </Button>
          <Button className="btn-gradient" onClick={handleSaveService}>
            💾 Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Add/Edit Combo */}
      <Modal show={showComboModal} onHide={handleCloseComboModal} size="lg">
        <Modal.Header closeButton className="spa-modal-header">
          <Modal.Title className="spa-modal-title">
            {comboModalMode === "add"
              ? "🎁 Tạo Combo Mới"
              : "✏️ Chỉnh Sửa Combo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCombo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label">Tên Combo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: Combo Thư Giãn Cuối Tuần"
                  value={currentCombo.name}
                  onChange={(e) =>
                    setCurrentCombo({
                      ...currentCombo,
                      name: e.target.value,
                    })
                  }
                  className="spa-form-control"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label" style={{ display: "block" }}>
                  Chọn Dịch Vụ (Đã chọn: {(currentCombo.services || []).length})
                </Form.Label>
                <div className="combo-service-selector">
                  {services
                    .filter((s) => s.status === "active")
                    .map((service) => (
                      <div
                        key={service.id}
                        className={`combo-service-item ${
                          (currentCombo.services || []).includes(service.id)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => toggleServiceInCombo(service.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check
                              type="checkbox"
                              checked={(currentCombo.services || []).includes(
                                service.id
                              )}
                              onChange={() => toggleServiceInCombo(service.id)}
                              style={{ cursor: "pointer" }}
                            />
                            <div>
                              <div className="combo-service-name">
                                {service.name}
                              </div>
                              <small className="combo-service-info">
                                {service.duration} phút •{" "}
                                {categories[service.category]}
                              </small>
                            </div>
                          </div>
                          <div className="combo-service-price">
                            {service.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Form.Group>

              {currentCombo.services.length > 0 && (
                <Card className="mb-3 combo-overview-card">
                  <Card.Body>
                    <h6 className="combo-overview-title">📝 Tổng Quan Combo</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tổng giá gốc:</span>
                      <span className="combo-overview-row">
                        {services
                          .filter((s) => (currentCombo.services || []).includes(s.id))
                          .reduce((sum, s) => sum + s.price, 0)
                          .toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tổng thời gian:</span>
                      <span className="combo-overview-row">
                        {services
                          .filter((s) => (currentCombo.services || []).includes(s.id))
                          .reduce((sum, s) => sum + s.duration, 0)}{" "}
                        phút
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Giá Combo (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentCombo.price}
                      onChange={(e) =>
                        setCurrentCombo({
                          ...currentCombo,
                          price: Number(e.target.value),
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="spa-form-label">
                      Giảm Giá (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={currentCombo.discount}
                      onChange={(e) =>
                        setCurrentCombo({
                          ...currentCombo,
                          discount: Number(e.target.value),
                        })
                      }
                      className="spa-form-control"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="spa-form-label">Trạng Thái</Form.Label>
                <Form.Select
                  value={currentCombo.status}
                  onChange={(e) =>
                    setCurrentCombo({
                      ...currentCombo,
                      status: e.target.value,
                    })
                  }
                  className="spa-form-select"
                >
                  <option value="active">Đang Hoạt Động</option>
                  <option value="inactive">Ngưng Cung Cấp</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseComboModal}
            className="spa-modal-button"
          >
            Hủy
          </Button>
          <Button
            className="btn-gradient"
            onClick={handleSaveCombo}
            disabled={
              !currentCombo?.name ||
              (currentCombo.services || []).length === 0 ||
              !currentCombo?.price
            }
          >
            💾 Lưu Combo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SpaManagement;
