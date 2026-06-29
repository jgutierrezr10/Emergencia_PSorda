package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "catalogo_gifs")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CatalogoGifEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 500)
    private String ruta;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(name = "descripcion_texto", nullable = false, length = 255)
    private String descripcionTexto;
}
