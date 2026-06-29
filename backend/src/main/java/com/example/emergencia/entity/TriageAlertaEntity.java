package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "triage_alerta")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TriageAlertaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pregunta_clave", nullable = false, length = 255)
    private String preguntaClave;

    @Column(name = "respuesta_sordo", nullable = false)
    private Boolean respuestaSordo;

    @Column(name = "hora_respuesta", nullable = false)
    private LocalDateTime horaRespuesta;

    @ManyToOne
    @JoinColumn(name = "alerta_id", nullable = false)
    private AlertaEntity alerta;
}
