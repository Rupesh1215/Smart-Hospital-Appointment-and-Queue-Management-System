package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.service.GeminiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiService geminiService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatbotResponse>> processMessage(@RequestBody ChatbotRequest request) {
        String aiReply = geminiService.generateChatResponse(request.getMessage(), request.getConversationHistory());
        
        ChatbotResponse response = new ChatbotResponse();
        response.setReply(aiReply);
        response.setTimestamp(System.currentTimeMillis());

        return ResponseEntity.ok(ApiResponse.success("Message processed", response));
    }

    @Data
    public static class ChatbotRequest {
        private String message;
        private List<Map<String, String>> conversationHistory;
    }

    @Data
    public static class ChatbotResponse {
        private String reply;
        private long timestamp;
    }
}
