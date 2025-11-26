import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { showToast } from '../../components/Toast';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        const orderId = searchParams.get('orderId');

        console.log('Payment result:', { resultCode, message, orderId });

        // MoMo result codes:
        // 0 = Success
        // 1006 = User cancelled
        // Other = Error

        if (resultCode === '0') {
            // Payment successful
            showToast('Thanh toán thành công!', 'success');
            setTimeout(() => {
                navigate('/AppointmentManager');
            }, 2000);
        } else if (resultCode === '1006') {
            // User cancelled
            showToast('Bạn đã hủy thanh toán. Vui lòng chọn phương thức thanh toán khác.', 'warning');
            setTimeout(() => {
                navigate('/BookingPage');
            }, 2000);
        } else {
            // Payment failed
            showToast(`Thanh toán thất bại: ${decodeURIComponent(message || 'Lỗi không xác định')}`, 'error');
            setTimeout(() => {
                navigate('/BookingPage');
            }, 2000);
        }

        setProcessing(false);
    }, [searchParams, navigate]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div className="card shadow-lg border-0" style={{ maxWidth: '500px', borderRadius: '15px' }}>
                <div className="card-body p-5 text-center">
                    {processing ? (
                        <>
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h4>Đang xử lý kết quả thanh toán...</h4>
                            <p className="text-muted">Vui lòng đợi trong giây lát</p>
                        </>
                    ) : (
                        <>
                            <h4>Đang chuyển hướng...</h4>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
