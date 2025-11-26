import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, Gift, Star, Info, Trash2, Eye } from 'lucide-react';
import { showToast } from "../../components/Toast";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/thong-bao');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      // Sort by date descending
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Không thể tải danh sách thông báo", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'REMINDER': return <Calendar size={20} className="text-primary" />;
      case 'CONFIRMATION': return <CheckCircle size={20} className="text-success" />;
      case 'PROMOTION': return <Gift size={20} className="text-danger" />;
      case 'COMPLETION': return <Star size={20} className="text-warning" />;
      case 'SYSTEM': return <Info size={20} className="text-info" />;
      default: return <Info size={20} className="text-muted" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/thong-bao/${id}/da-doc`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to mark as read');
      fetchNotifications(); // Refetch to update UI
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/thong-bao/da-doc-tat-ca', { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to mark all as read');
      fetchNotifications();
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
        try {
            const response = await fetch(`/api/thong-bao/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete');
            fetchNotifications();
        } catch (error) {
            console.error("Delete error:", error);
        }
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.daDoc;
    if (filter === 'read') return notif.daDoc;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.daDoc).length;

  const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="text-white text-center py-5" style={{ background: 'linear-gradient(135deg, #e91e63, #9c27b0)' }}>
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">Thông báo</h1>
          <p className="lead">Theo dõi các thông báo và nhắc nhở quan trọng</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="bg-white rounded shadow-sm">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1 fw-bold">Hộp thư thông báo</h4>
                  {unreadCount > 0 ? 
                    <p className="text-danger mb-0">Bạn có {unreadCount} thông báo chưa đọc</p> : 
                    <p className="text-muted mb-0">Bạn không có thông báo mới</p>
                  }
                </div>
                <div className="d-flex gap-2">
                  <div className="dropdown">
                    <button className="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                      {filter === 'all' ? 'Tất cả' : filter === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => setFilter('all')}>Tất cả</button></li>
                      <li><button className="dropdown-item" onClick={() => setFilter('unread')}>Chưa đọc</button></li>
                      <li><button className="dropdown-item" onClick={() => setFilter('read')}>Đã đọc</button></li>
                    </ul>
                  </div>
                  <button className="btn btn-outline-primary btn-sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
              </div>

              <div className="p-0">
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <Info size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">Không có thông báo nào</h6>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`notification-item p-4 border-bottom position-relative ${!notification.daDoc ? 'bg-light' : ''}`}
                      style={{ borderLeft: notification.quanTrong ? '4px solid #e91e63' : 'none', cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1">{getIcon(notification.loai)}</div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1 fw-semibold d-flex align-items-center">
                              {notification.tieuDe}
                              {notification.quanTrong && <span className="badge ms-2" style={{ backgroundColor: '#e91e63', fontSize: '10px' }}>Quan trọng</span>}
                              {!notification.daDoc && <span className="badge bg-primary ms-2" style={{ fontSize: '8px' }}>●</span>}
                            </h6>
                            <div className="d-flex gap-2">
                              {!notification.daDoc && (
                                <button className="btn btn-sm p-1" onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} title="Đánh dấu đã đọc">
                                  <Eye size={16} className="text-muted" />
                                </button>
                              )}
                              <button className="btn btn-sm p-1" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} title="Xóa thông báo">
                                <Trash2 size={16} className="text-danger" />
                              </button>
                            </div>
                          </div>
                          <p className="text-muted mb-2 small">{notification.noiDung}</p>
                          <small className="text-muted">{formatDate(notification.createdAt)}</small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div>
  );
};

export default NotificationsPage;
