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

    @Column(name = "latitud_casa", length = 50)
    private String latitudCasa;

    @Column(name = "longitud_casa", length = 50)
    private String longitudCasa;

    @Column(name = "nombre_referencia_casa", length = 100)
    private String nombreReferenciaCasa;

    @Column(name = "documento_validacion_url", length = 500)
    private String documentoValidacionUrl;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;
}
