package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.HashMap;

@Service
public class MessageTemplateService {

    public Map<String, String> getMessageTemplates() {
        Map<String, String> templates = new HashMap<>();
        templates.put("reminder", "Xin chào [TÊN],\n\nSpa chúng tôi xin nhắc nhở lịch hẹn:\n📅 Thời gian: [LỊCH HẸN]\n💆 Dịch vụ: [DỊCH VỤ YÊU THÍCH]\n\nNếu có thay đổi, vui lòng liên hệ: 0123456789");
        templates.put("thankyou", "Cảm ơn [TÊN] đã sử dụng dịch vụ!\n\nHy vọng bạn hài lòng với trải nghiệm tại spa.\n⭐ Bạn có [ĐIỂM] điểm tích lũy\n🎁 Giảm 10% cho lần đặt tiếp theo!");
        templates.put("promotion", "[TÊN] thân mến,\n\n🎉 ưu đãi đặc biệt dành riêng cho bạn:\n✨ Giảm 20% [DỊCH VỤ YÊU THÍCH]\n🎁 Tặng voucher 100k\n📅 Áp dụng đến 31/10\n\nĐặt lịch ngay: 0123456789");
        templates.put("birthday", "🎂 Chúc mừng sinh nhật [TÊN]! 🎉\n\nSpa gửi tặng bạn:\n🎁 Voucher 200k\n💝 Giảm 30% tất cả dịch vụ\n🌟 Điểm thưởng x2\n\nHạnh phúc mỗi ngày! ❤️");
        templates.put("loyalty", "Thân gửi [TÊN] - Khách hàng VIP,\n\n🌟 Bạn có [ĐIỂM] điểm tích lũy\n💎 Thăng hạng: [TRẠNG THÁI]\n🎁 Ưu đãi độc quyền dành cho bạn\n\nCảm ơn sự tin yêu của bạn!");
        templates.put("comeback", "Chào [TÊN],\n\nĐã lâu không gặp bạn! 😊\n🎁 Ưu đãi đặc biệt:\n- Giảm 25% dịch vụ [DỊCH VỤ YÊU THÍCH]\n- Tặng thêm 50 điểm tích lũy\n\nHẹn sớm gặp lại bạn!");
        return templates;
    }
}
