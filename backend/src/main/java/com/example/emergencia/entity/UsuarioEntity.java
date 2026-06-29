package com.example.emergencia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@Table(name = "usuarios")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(length = 50, nullable = false)
    private String nombre;

    @NotNull
    @Column(length = 50, nullable = false)
    private String apellido;

    @NotNull
    @Column(length = 9, nullable = false, unique = true)
    private String telefono;

    @NotNull
    @Column(length = 12, nullable = false, unique = true)
    private String rut;

    @NotNull
    @Column(length = 255, nullable = false)
    private String clave;

    @NotNull
    @Column(nullable = false)
    private String estado;

    @NotNull
    @Column(length = 50, nullable = false)
    private String rol;

}
