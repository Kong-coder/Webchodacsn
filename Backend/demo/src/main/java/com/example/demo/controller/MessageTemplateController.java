package com.example.demo.controller;

import com.example.demo.service.MessageTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/message-templates")
public class MessageTemplateController {

    private final MessageTemplateService messageTemplateService;

    public MessageTemplateController(MessageTemplateService messageTemplateService) {
        this.messageTemplateService = messageTemplateService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getMessageTemplates() {
        return ResponseEntity.ok(messageTemplateService.getMessageTemplates());
    }
}
