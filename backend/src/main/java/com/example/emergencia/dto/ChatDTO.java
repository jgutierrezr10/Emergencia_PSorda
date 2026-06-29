package com.example.emergencia.dto;

import lombok.Data;

@Data
public class ChatDTO {
    private String autor; // "yo" o "op"
    private String tipo;  // "texto" o "gif"
    private String texto; // el texto o el ID del gif
}
