package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contactos_emergencia")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ContactoEmergenciaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 15)
    private String numero;

    @ManyToOne
    @JoinColumn(name = "personaSorda_id", nullable = false)
    private PersonaSordaEntity personaSorda;
}
