package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "personas_sordas")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PersonaSordaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String direccion;

    @Column(name = "info_medica", columnDefinition = "TEXT")
    private String infoMedica;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;
}
