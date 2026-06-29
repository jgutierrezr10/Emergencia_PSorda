package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "carabineros")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CarabineroEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false, length = 50)
    private String rango;

    @Column(name = "numero_institucional", nullable = false)
    private Integer numeroInstitucional;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;
}
