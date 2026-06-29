package com.example.emergencia.controller;

import com.example.emergencia.entity.AlertaEntity;
import com.example.emergencia.interfaces.IAlertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
@CrossOrigin(origins = "*")
public class AlertaController {

    @Autowired
    private IAlertaService alertaService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<AlertaEntity>> getAll() {
        return ResponseEntity.ok(alertaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alertaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AlertaEntity> create(@RequestBody AlertaEntity alerta) {
        AlertaEntity saved = alertaService.save(alerta);
        messagingTemplate.convertAndSend("/topic/alertas", saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlertaEntity> update(@PathVariable Long id, @RequestBody AlertaEntity alerta) {
        alerta.setId(id);
        return ResponseEntity.ok(alertaService.update(alerta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        alertaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/nueva")
    public ResponseEntity<AlertaEntity> crearNuevaAlerta(@RequestBody com.example.emergencia.dto.NuevaAlertaRequest request) {
        AlertaEntity saved = alertaService.crearAlertaPorRut(request.getRut(), request.getLatitudLongitud());
        messagingTemplate.convertAndSend("/topic/alertas", saved);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
