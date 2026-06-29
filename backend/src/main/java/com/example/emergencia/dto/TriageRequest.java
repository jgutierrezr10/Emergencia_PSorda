package com.example.emergencia.dto;

import lombok.Data;
import java.util.List;

@Data
public class TriageRequest {
    private Long alertaId;
    private List<TriageRespuestaDTO> respuestas;
}
