package com.medimate.controller;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class PatientDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(AccessLogController.class);

    @GetMapping("/api/patient-dashboard")
    public ResponseEntity<?> getPatientDashboard(@RequestParam String name, @RequestParam String code) {

        logger.info("요청 받은 name: {}, code: {}", name, code);

        try {
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<QuerySnapshot> future = db.collection("users")
                    .whereEqualTo("name", name)
                    .whereEqualTo("customId", code)
                    .whereEqualTo("role", "user")
                    .get();

            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            // 로그 띄우기
            logger.info("쿼리 결과 개수: {}", docs.size());

            for (QueryDocumentSnapshot doc : docs) {
                logger.info("문서 ID: {}", doc.getId());
                logger.info("데이터: {}", doc.getData());
            }
            
            
            if (docs.isEmpty()) {
                return ResponseEntity.status(404).body("환자를 찾을 수 없습니다.");
            }

            DocumentSnapshot patient = docs.get(0);

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("patientId", patient.getId());    // firebase에서의 고유 ID
            dashboard.put("symptoms", patient.get("symptomHistory"));
            dashboard.put("medications", patient.get("medicationTimeline"));
            dashboard.put("clinicVisits", patient.get("visitLogs"));

            return ResponseEntity.ok(dashboard);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
        }
    }
}
