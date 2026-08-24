package com.hospital.smart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.0-flash}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_INSTRUCTION = """
            You are 'SmartCare AI', the official AI assistant for the Smart Hospital Appointment Management Platform.
            
            Your responsibilities:
            1. Help patients find the right medical department based on their symptoms.
            2. Answer questions about hospital departments: Cardiology, Neurology, Orthopedics, Dermatology, General Medicine, Pediatrics, ENT, Ophthalmology.
            3. Guide patients on how to book appointments, check queue positions, and view appointment details.
            4. Answer general health FAQs with empathy, but always advise consulting a qualified doctor for diagnosis.
            5. NEVER diagnose diseases, prescribe medication, or invent doctors/appointment slots.
            6. For emergencies, direct patients to call emergency services immediately.
            
            Keep responses concise (2-4 sentences), helpful, and professional.
            Use simple language that patients can understand.
            When listing departments or options, use bullet points.
            """;

    public String generateChatResponse(String userPrompt, List<Map<String, String>> history) {
        log.info("Chatbot received message: {}", userPrompt);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured. Using rule-based fallback.");
            return generateRuleBasedFallback(userPrompt);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build contents array with conversation history + current message
            List<Map<String, Object>> contents = new ArrayList<>();

            // Include conversation history (limit to last 10 messages to avoid large payloads)
            if (history != null && !history.isEmpty()) {
                int startIdx = Math.max(0, history.size() - 10);
                for (int i = startIdx; i < history.size(); i++) {
                    Map<String, String> msg = history.get(i);
                    String role = msg.get("role");
                    String text = msg.get("text");
                    if (role != null && text != null && !text.isEmpty()) {
                        // Gemini uses "user" and "model" roles
                        String geminiRole = "user".equals(role) ? "user" : "model";
                        Map<String, Object> turn = new HashMap<>();
                        turn.put("role", geminiRole);
                        turn.put("parts", List.of(Map.of("text", text)));
                        contents.add(turn);
                    }
                }
            }

            // Add the current user message
            Map<String, Object> currentMessage = new HashMap<>();
            currentMessage.put("role", "user");
            currentMessage.put("parts", List.of(Map.of("text", userPrompt)));
            contents.add(currentMessage);

            // Build system instruction properly
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION)));

            // Build full request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("systemInstruction", systemInstruction);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseStr = restTemplate.postForObject(url, entity, String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    String reply = textNode.asText();
                    log.info("Gemini API responded successfully");
                    return reply;
                }
            }

            log.warn("Gemini response did not contain expected text structure");
        } catch (Exception e) {
            log.error("Failed to query Gemini API: {}", e.getMessage());
        }

        return generateRuleBasedFallback(userPrompt);
    }

    private String generateRuleBasedFallback(String prompt) {
        String lower = prompt.toLowerCase().trim();

        // Greetings
        if (lower.matches("^(hi|hello|hey|good morning|good afternoon|good evening|howdy).*")) {
            return "Hello! 👋 I'm SmartCare AI, your hospital assistant. I can help you:\n\n• Find the right department for your symptoms\n• Guide you through booking an appointment\n• Check your queue status\n• Answer questions about our services\n\nHow can I help you today?";
        }

        // Cardiology
        if (lower.contains("heart") || lower.contains("chest pain") || lower.contains("cardio") || lower.contains("cardiologist") || lower.contains("blood pressure") || lower.contains("palpitation")) {
            return "For heart-related concerns like chest pain, blood pressure issues, or palpitations, please visit our **Cardiology Department**. You can book an appointment by going to 'Find Doctor' and selecting a cardiologist.\n\n⚠️ If you're experiencing severe chest pain, please visit the Emergency Department immediately.";
        }

        // Dermatology
        if (lower.contains("skin") || lower.contains("rash") || lower.contains("derma") || lower.contains("acne") || lower.contains("allergy") || lower.contains("allergies") || lower.contains("itch")) {
            return "For skin conditions, rashes, acne, or allergies, our **Dermatology Department** can help. Book an appointment through 'Find Doctor' → select 'Dermatology' department to see available dermatologists.";
        }

        // Orthopedics
        if (lower.contains("bone") || lower.contains("joint") || lower.contains("fracture") || lower.contains("ortho") || lower.contains("back pain") || lower.contains("spine") || lower.contains("knee")) {
            return "For bone, joint, knee, or spine-related issues, please book with our **Orthopedics Department**. Go to 'Find Doctor' → select 'Orthopedics' to see available specialists.";
        }

        // Neurology
        if (lower.contains("headache") || lower.contains("nerve") || lower.contains("brain") || lower.contains("neuro") || lower.contains("migraine") || lower.contains("seizure") || lower.contains("dizziness")) {
            return "For neurological symptoms like headaches, migraines, dizziness, or nerve pain, we recommend consulting our **Neurology Department**. Book through 'Find Doctor' → 'Neurology'.";
        }

        // Pediatrics
        if (lower.contains("child") || lower.contains("baby") || lower.contains("pedia") || lower.contains("infant") || lower.contains("kid") || lower.contains("toddler")) {
            return "For children's healthcare needs, please book with our **Pediatrics Department**. Our pediatricians specialize in infant and child healthcare. Go to 'Find Doctor' → 'Pediatrics'.";
        }

        // ENT
        if (lower.contains("ear") || lower.contains("nose") || lower.contains("throat") || lower.contains("ent") || lower.contains("sinus") || lower.contains("hearing")) {
            return "For ear, nose, or throat issues including sinus problems and hearing concerns, visit our **ENT Department**. Book through 'Find Doctor' → 'ENT'.";
        }

        // Ophthalmology
        if (lower.contains("eye") || lower.contains("vision") || lower.contains("ophthal") || lower.contains("glasses") || lower.contains("sight")) {
            return "For eye and vision-related concerns, our **Ophthalmology Department** is here to help. Book an appointment through 'Find Doctor' → 'Ophthalmology'.";
        }

        // General Medicine
        if (lower.contains("fever") || lower.contains("cold") || lower.contains("cough") || lower.contains("flu") || lower.contains("general") || lower.contains("checkup") || lower.contains("check-up") || lower.contains("tired") || lower.contains("fatigue")) {
            return "For general health concerns like fever, cold, cough, or routine check-ups, our **General Medicine Department** is the right choice. Book through 'Find Doctor' → 'General Medicine'.";
        }

        // Queue related
        if (lower.contains("queue") || lower.contains("token") || lower.contains("wait") || lower.contains("position") || lower.contains("turn")) {
            return "You can check your real-time queue position from the **Queue Status** page in your dashboard. It shows your token number, current position, estimated wait time, and the doctor's current token.";
        }

        // Booking related
        if (lower.contains("book") || lower.contains("appointment") || lower.contains("slot") || lower.contains("schedule")) {
            return "To book an appointment:\n\n1. Go to **Find Doctor** in your dashboard\n2. Select a department or search for a doctor\n3. Pick an available date and time slot\n4. Confirm your booking\n\nYou'll receive a confirmation with your appointment details and token number.";
        }

        // Cancel related
        if (lower.contains("cancel")) {
            return "To cancel an appointment, go to **My Appointments**, find the appointment you want to cancel, and click the 'Cancel' button. Please note that cancellations should be made at least a few hours before your scheduled time.";
        }

        // Department listing
        if (lower.contains("department") || lower.contains("specialit") || lower.contains("specialt")) {
            return "Our hospital has the following departments:\n\n• **Cardiology** — Heart & cardiovascular\n• **Neurology** — Brain & nervous system\n• **Orthopedics** — Bones & joints\n• **Dermatology** — Skin conditions\n• **General Medicine** — General health\n• **Pediatrics** — Children's health\n• **ENT** — Ear, nose & throat\n• **Ophthalmology** — Eye care\n\nWould you like to book with any specific department?";
        }

        // Doctor related
        if (lower.contains("doctor") || lower.contains("physician") || lower.contains("specialist")) {
            return "You can find and book doctors through the **Find Doctor** page. You can filter by department, view doctor profiles, check their availability, and book appointments directly. Would you like help finding a doctor in a specific department?";
        }

        // Help / what can you do
        if (lower.contains("help") || lower.contains("what can you") || lower.contains("what do you") || lower.contains("how does") || lower.contains("how do i")) {
            return "I can help you with:\n\n• **Finding departments** — Tell me your symptoms and I'll suggest the right department\n• **Booking appointments** — I'll guide you step by step\n• **Queue information** — Check your position in the queue\n• **Hospital services** — Learn about our departments and doctors\n\nWhat would you like help with?";
        }

        // Thanks
        if (lower.contains("thank") || lower.contains("thanks") || lower.contains("bye") || lower.contains("goodbye")) {
            return "You're welcome! 😊 If you need any more help, feel free to ask. Wishing you good health!";
        }

        // Emergency
        if (lower.contains("emergency") || lower.contains("urgent") || lower.contains("critical") || lower.contains("ambulance")) {
            return "⚠️ **For medical emergencies, please call emergency services or visit our Emergency Department immediately.** Do not wait for an online appointment. If someone is in immediate danger, call your local emergency number right away.";
        }

        // Default — varied response that acknowledges the question
        return "I'm not sure I understand your question completely. I can help you with:\n\n• Finding the right department for your symptoms\n• Booking appointments with our doctors\n• Checking your queue status\n• Information about hospital departments\n\nCould you please rephrase your question or choose one of the options above?";
    }
}
