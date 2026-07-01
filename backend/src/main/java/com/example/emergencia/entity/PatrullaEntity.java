package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patrullas")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PatrullaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String patente;

    @Column(name = "longitud_latitud", length = 100)
    private String longitudLatitud;

    @Column(nullable = false, length = 50)
    private String estado;

}
