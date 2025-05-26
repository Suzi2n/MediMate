package com.medimate.controller;

import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.medimate.dto.AccessLogRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:5174"},
        allowCredentials = "true"
)
@RequestMapping("/api/access-log")
public class AccessLogController {

    private final Firestore firestore = FirestoreClient.getFirestore();

        @PostMapping("/request-access")
        public ResponseEntity<?> requestAccess(@RequestBody AccessLogRequest request) {
            if (request.getSearcherId() == null || request.getTargetPatientId() == null) {
                return ResponseEntity.badRequest().body("필수 항목 누락");
            }

            Map<String, Object> log = new HashMap<>();
            log.put("type", "SEARCH");
            log.put("searcherId", request.getSearcherId());
            log.put("targetPatientId", request.getTargetPatientId());
            log.put("status", "pending");
            //log.put("timestamp", com.google.cloud.Timestamp.now());
            log.put("timestamp", FieldValue.serverTimestamp());
            log.put("searcherNickname", request.getSearcherNickname());

            try {
                firestore.collection("access_logs").add(log);
                return ResponseEntity.status(201).body("승인 요청 전송됨");
            } catch (Exception e) {
                return ResponseEntity.status(500).body("오류 발생: " + e.getMessage());
            }
        }
    }


