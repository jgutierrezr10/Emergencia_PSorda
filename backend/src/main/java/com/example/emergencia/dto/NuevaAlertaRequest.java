package com.example.emergencia.dto;

import lombok.Data;

@Data
public class NuevaAlertaRequest {
    private String rut;
    private String latitudLongitud;
}
