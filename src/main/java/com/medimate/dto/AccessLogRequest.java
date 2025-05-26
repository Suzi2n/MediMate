package com.medimate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class AccessLogRequest {
    private String searcherId;
    private String targetPatientId;

    private String searcherNickname;

//    private String type;
    private String status;
//   private com.google.cloud.Timestamp timestamp;

}
