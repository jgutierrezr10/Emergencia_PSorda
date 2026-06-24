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
    private String Nombre;

    @NotNull
    @Column(length = 50, nullable = false)
    private String Apellido;

    @NotNull
    @Column(length = 9, nullable = false, unique = true)
    private String Telefono;

    @NotNull
    @Column(length = 12, nullable = false, unique = true)
    private String Rut;

    @NotNull
    @Column(length = 20, nullable = false)
    private String Clave;

    @NotNull
    @Column(nullable = false)
    private String Estado;

}
