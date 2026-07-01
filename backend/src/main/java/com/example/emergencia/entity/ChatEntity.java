package com.example.emergencia.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String texto;

    @Column(name = "fecha_hora_envio", nullable = false)
    private LocalDateTime fechaHoraEnvio;

    @Column(name = "emisor_id", nullable = false)
    private Long emisorId;

    @ManyToOne
    @JoinColumn(name = "alerta_id", nullable = false)
    private AlertaEntity alerta;


    @Column(name = "tipo", length = 50)
    private String tipo;

    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    @Column(name = "tipo_archivo", length = 100)
    private String tipoArchivo;
}
