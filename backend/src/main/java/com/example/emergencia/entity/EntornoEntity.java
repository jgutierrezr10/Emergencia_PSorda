package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "entornos")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class EntornoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String parentesco;

    @Column(name = "vive_con_usuario", nullable = false)
    private Boolean viveConUsuario;

    @ManyToOne
    @JoinColumn(name = "personaSorda_id", nullable = false)
    private PersonaSordaEntity personaSorda;
}
