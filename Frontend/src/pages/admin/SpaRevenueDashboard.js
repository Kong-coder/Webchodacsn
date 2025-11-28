import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Download, FileText } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/admin/SpaRevenueDashboard.css";

// Helper to format date to YYYY-MM-DD for API calls
const toApiDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============= COMPONENTS =============

const DateFilter = ({ dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, onExportExcel, onExportPDF }) => (
  <div className="card shadow-sm">
    <div className="card-body">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label fw-semibold"><Calendar size={16} className="me-1" />Khoảng thời gian</label>
          <select className="form-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>
        {dateRange === 'custom' && (
          <>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Từ ngày</label>
              <input type="date" className="form-control" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Đến ngày</label>
              <input type="date" className="form-control" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
            </div>
          </>
        )}
        <div className="col-md-3 ms-auto">
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={onExportExcel}><Download size={16} className="me-1" />Excel</button>
            <button className="btn btn-danger" onClick={onExportPDF}><FileText size={16} className="me-1" />PDF</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const KPICard = ({ title, value, subtitle, icon: Icon, iconBgColor, trend }) => (
  <div className="col-md-3">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h3 className="fw-bold mb-1">{value}</h3>
            {trend ? (
              <small className={`fw-semibold ${trend.value >= 0 ? 'text-success' : 'text-danger'}`}>
                {trend.value >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {' '}{Math.abs(trend.value).toFixed(1)}% {trend.label}
              </small>
            ) : (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
          <div className={`${iconBgColor} p-3 rounded`}>
            <Icon size={24} className={iconBgColor.replace('bg-', 'text-').replace(' bg-opacity-10', '')} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RevenueLineChart = ({ data }) => (
    <div className="col-md-8">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">Biểu Đồ Doanh Thu Theo Thời Gian</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Triệu VNĐ', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(2)}M VNĐ`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

const ServicePieChart = ({ data }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    return (
      <div className="col-md-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="card-title fw-bold mb-3">Tỷ Lệ Doanh Thu Dịch Vụ</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name.substring(0, 10)}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}M VNĐ`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
};

const TopCustomersTable = ({ customers }) => (
    <div className="col-md-6">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">🏆 Top 5 Khách Hàng VIP</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Tên Khách Hàng</th>
                  <th className="text-center">Số Lượt</th>
                  <th className="text-end">Tổng Chi Tiêu</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index}>
                    <td><span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-info' : 'bg-light text-dark'}`}>{index + 1}</span></td>
                    <td className="fw-semibold">{customer.customerName}</td>
                    <td className="text-center">{customer.bookingCount}</td>
                    <td className="text-end fw-bold text-success">{customer.totalSpent.toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

const ServiceStatsTable = ({ services }) => (
    <div className="col-md-6">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">📈 Thống Kê Dịch Vụ Phổ Biến</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Dịch Vụ</th>
                  <th className="text-center">Số Lượt</th>
                  <th className="text-end">Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{service.serviceName}</td>
                    <td className="text-center"><span className="badge bg-primary">{service.bookingCount}</span></td>
                    <td className="text-end">{(service.totalRevenue).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

// ============= MAIN COMPONENT =============
const SpaRevenueDashboard = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState(toApiDate(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [customEndDate, setCustomEndDate] = useState(toApiDate(new Date()));

  const [kpis, setKpis] = useState({ totalRevenue: 0, totalCustomers: 0, avgRevenuePerCustomer: 0, totalTransactions: 0 });
  const [revenueByDate, setRevenueByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start = new Date(today.setHours(0, 0, 0, 0));
        break;
      case '7days':
        start.setDate(today.getDate() - 7);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case '90days':
        start.setDate(today.getDate() - 90);
        break;
      case 'custom':
        return { startDate: customStartDate, endDate: customEndDate };
      default:
        start.setDate(today.getDate() - 30);
    }
    return { startDate: toApiDate(start), endDate: toApiDate(end) };
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const headers = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };
        
        const params = new URLSearchParams({ startDate, endDate });
        
        console.log('Fetching revenue data with params:', { startDate, endDate });
        
        const [statsRes, byDateRes, byServiceRes, topCustomersRes] = await Promise.all([
          fetch(`/api/revenue/stats?${params.toString()}`, { headers }),
          fetch(`/api/revenue/by-date?${params.toString()}`, { headers }),
          fetch(`/api/revenue/by-service?${params.toString()}`, { headers }),
          fetch(`/api/revenue/top-customers?${params.toString()}`, { headers }),
        ]);

        console.log('Response statuses:', {
          stats: statsRes.status,
          byDate: byDateRes.status,
          byService: byServiceRes.status,
          topCustomers: topCustomersRes.status
        });

        if (!statsRes.ok) {
          const errorText = await statsRes.text();
          console.error('Stats API error:', statsRes.status, errorText);
          throw new Error(`Failed to fetch stats: ${statsRes.status} - ${errorText}`);
        }
        
        if (!byDateRes.ok) {
          const errorText = await byDateRes.text();
          console.error('By-date API error:', byDateRes.status, errorText);
          throw new Error(`Failed to fetch by-date: ${byDateRes.status} - ${errorText}`);
        }
        
        if (!byServiceRes.ok) {
          const errorText = await byServiceRes.text();
          console.error('By-service API error:', byServiceRes.status, errorText);
          throw new Error(`Failed to fetch by-service: ${byServiceRes.status} - ${errorText}`);
        }
        
        if (!topCustomersRes.ok) {
          const errorText = await topCustomersRes.text();
          console.error('Top-customers API error:', topCustomersRes.status, errorText);
          throw new Error(`Failed to fetch top-customers: ${topCustomersRes.status} - ${errorText}`);
        }

        const statsData = await statsRes.json();
        const byDateData = await byDateRes.json();
        const byServiceData = await byServiceRes.json();
        const topCustomersData = await topCustomersRes.json();

        console.log('Fetched data:', { statsData, byDateData, byServiceData, topCustomersData });
        console.log('Service stats sample:', byServiceData[0]);
        console.log('Top customers sample:', topCustomersData[0]);

        setKpis(statsData);
        
        // Map byDateData - PostgreSQL returns lowercase field names
        setRevenueByDate(byDateData.map(d => ({ 
          date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), 
          revenue: (d.totalRevenue || d.totalrevenue || 0) / 1000000,
          totalOrders: d.totalOrders || d.totalorders || 0
        })));
        
        // Map byServiceData - PostgreSQL returns lowercase field names
        setServiceStats(byServiceData.map(s => ({
          serviceName: s.serviceName || s.servicename || 'Unknown',
          bookingCount: s.bookingCount || s.bookingcount || 0,
          totalRevenue: s.totalRevenue || s.totalrevenue || 0
        })));
        
        // Map topCustomersData - PostgreSQL returns lowercase field names
        setTopCustomers(topCustomersData.map(c => ({
          customerId: c.customerId || c.customerid,
          customerName: c.customerName || c.customername || 'Unknown',
          bookingCount: c.bookingCount || c.bookingcount || 0,
          totalSpent: c.totalSpent || c.totalspent || 0
        })));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        alert(`Không thể tải dữ liệu dashboard: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [startDate, endDate]);

  const pieChartData = useMemo(() => 
    serviceStats.map(s => ({ name: s.serviceName, value: s.totalRevenue / 1000000 }))
  , [serviceStats]);

  const handleExportExcel = () => {
    // Tạo CSV content (Excel có thể mở file CSV)
    const csvContent = [];
    
    // Header
    csvContent.push('\uFEFF'); // BOM for UTF-8
    csvContent.push('BÁO CÁO DOANH THU\n');
    csvContent.push(`Từ ngày: ${startDate} - Đến ngày: ${endDate}\n\n`);
    
    // KPIs - với kiểm tra an toàn
    csvContent.push('TỔNG QUAN\n');
    csvContent.push('Chỉ tiêu,Giá trị\n');
    csvContent.push(`Tổng doanh thu,${(kpis?.totalRevenue || 0).toLocaleString('vi-VN')}đ\n`);
    csvContent.push(`Tổng đơn hàng,${kpis?.totalOrders || 0}\n`);
    csvContent.push(`Tổng khách hàng,${kpis?.totalCustomers || 0}\n`);
    csvContent.push(`Doanh thu trung bình/đơn,${(kpis?.avgOrderValue || 0).toLocaleString('vi-VN')}đ\n\n`);
    
    // Revenue by date
    if (revenueByDate && revenueByDate.length > 0) {
      csvContent.push('DOANH THU THEO NGÀY\n');
      csvContent.push('Ngày,Doanh thu (VNĐ),Số đơn\n');
      revenueByDate.forEach(item => {
        csvContent.push(`${item.date || 'N/A'},${((item.revenue || 0) * 1000000).toLocaleString('vi-VN')},${item.totalOrders || 0}\n`);
      });
      csvContent.push('\n');
    }
    
    // Service stats
    if (serviceStats && serviceStats.length > 0) {
      csvContent.push('DOANH THU THEO DỊCH VỤ\n');
      csvContent.push('Dịch vụ,Số lượt đặt,Doanh thu (VNĐ)\n');
      serviceStats.forEach(item => {
        csvContent.push(`${item.serviceName || 'N/A'},${item.bookingCount || 0},${(item.totalRevenue || 0).toLocaleString('vi-VN')}\n`);
      });
      csvContent.push('\n');
    }
    
    // Top customers
    if (topCustomers && topCustomers.length > 0) {
      csvContent.push('TOP KHÁCH HÀNG\n');
      csvContent.push('Tên khách hàng,Số lượt đặt,Tổng chi tiêu (VNĐ)\n');
      topCustomers.forEach(item => {
        csvContent.push(`${item.customerName || 'N/A'},${item.bookingCount || 0},${(item.totalSpent || 0).toLocaleString('vi-VN')}\n`);
      });
    }
    
    // Download
    const blob = new Blob([csvContent.join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BaoCaoDoanhThu_${startDate}_${endDate}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const reportDate = new Date().toLocaleString('vi-VN');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo doanh thu</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { margin: 0; }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0088FE;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0088FE;
            margin: 0 0 10px 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .kpi-box {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
          }
          .kpi-box h3 {
            color: #666;
            font-size: 14px;
            margin: 0 0 10px 0;
            text-transform: uppercase;
          }
          .kpi-box .value {
            color: #0088FE;
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #0088FE;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #0088FE;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background: #f8f9fa;
            color: #0088FE;
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BÁO CÁO DOANH THU</h1>
          <p>Từ ngày: ${startDate} - Đến ngày: ${endDate}</p>
          <p>Ngày xuất: ${reportDate}</p>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <h3>Tổng doanh thu</h3>
            <div class="value">${((kpis?.totalRevenue || 0) / 1000000).toFixed(1)}M VNĐ</div>
          </div>
          <div class="kpi-box">
            <h3>Tổng đơn hàng</h3>
            <div class="value">${kpis?.totalOrders || 0}</div>
          </div>
          <div class="kpi-box">
            <h3>Tổng khách hàng</h3>
            <div class="value">${kpis?.totalCustomers || 0}</div>
          </div>
          <div class="kpi-box">
            <h3>Trung bình/đơn</h3>
            <div class="value">${((kpis?.avgOrderValue || 0) / 1000).toFixed(0)}K VNĐ</div>
          </div>
        </div>

        <div class="section">
          <h2>Doanh thu theo dịch vụ</h2>
          <table>
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Số lượt đặt</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              ${(serviceStats || []).map(item => `
                <tr>
                  <td>${item.serviceName || 'N/A'}</td>
                  <td>${item.bookingCount || 0}</td>
                  <td>${(item.totalRevenue || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Top khách hàng</h2>
          <table>
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Số lượt đặt</th>
                <th>Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              ${(topCustomers || []).map(item => `
                <tr>
                  <td>${item.customerName || 'N/A'}</td>
                  <td>${item.bookingCount || 0}</td>
                  <td>${(item.totalSpent || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi hệ thống BeautySpa</p>
          <p>© 2024 BeautySpa - All rights reserved</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading) {
      return <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}><h2>Đang tải dữ liệu...</h2></div>
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold text-primary mb-3">📊 Quản Lý Doanh Thu & Báo Cáo</h2>
          <DateFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <KPICard
          title="Tổng Doanh Thu"
          value={`${(kpis.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          iconBgColor="bg-primary bg-opacity-10"
          trend={{ value: kpis.revenueGrowthPercentage, label: 'so với kỳ trước' }}
        />
        <KPICard
          title="Số Khách Hàng"
          value={kpis.totalCustomers}
          subtitle={`${kpis.totalBookings} lượt dịch vụ`}
          icon={Users}
          iconBgColor="bg-success bg-opacity-10"
        />
        <KPICard
          title="TB/Khách"
          value={`${(kpis.avgRevenuePerCustomer / 1000000).toFixed(1)}M`}
          subtitle="Doanh thu trung bình"
          icon={TrendingUp}
          iconBgColor="bg-warning bg-opacity-10"
        />
        <KPICard
          title="Dịch Vụ Phổ Biến"
          value={serviceStats[0]?.serviceName ? serviceStats[0].serviceName.substring(0, 12) : 'N/A'}
          subtitle={serviceStats[0]?.bookingCount ? `${serviceStats[0].bookingCount} lượt sử dụng` : 'Chưa có dữ liệu'}
          icon={Calendar}
          iconBgColor="bg-info bg-opacity-10"
        />
      </div>

      <div className="row g-4 mb-4">
        <RevenueLineChart data={revenueByDate} />
        <ServicePieChart data={pieChartData} />
      </div>

      <div className="row g-4">
        <TopCustomersTable customers={topCustomers} />
        <ServiceStatsTable services={serviceStats} />
      </div>
    </div>
  );
};

export default SpaRevenueDashboard;
