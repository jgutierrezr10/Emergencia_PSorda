package com.example.emergencia.dto;

import lombok.Data;

@Data
public class SmsGatewayRequest {
    private String sender;
    private String message;
}
