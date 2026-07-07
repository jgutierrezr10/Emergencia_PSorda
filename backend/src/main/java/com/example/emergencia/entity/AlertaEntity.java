package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AlertaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_hora_inicio", nullable = false)
    private LocalDateTime fechaHoraInicio;

    @Column(name = "fecha_hora_fin")
    private LocalDateTime fechaHoraFin;

    @Column(name = "latitud_longitud", length = 100)
    private String latitudLongitud;

    @Column(name = "disponible_triage", nullable = false)
    private Boolean disponibleTriage;

    @Column(nullable = false, length = 50)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "personaSorda_id", nullable = false)
    private PersonaSordaEntity personaSorda;

    @Column(name = "incidente", length = 100)
    private String incidente;

    @Column(name = "modo_camuflaje")
    private Boolean modoCamuflaje;

    @Column(name = "notas_operador", columnDefinition = "TEXT")
    private String notasOperador;
}
