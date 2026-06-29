package com.example.emergencia.controller;

import com.example.emergencia.entity.TriageAlertaEntity;
import com.example.emergencia.interfaces.ITriageAlertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triage-alertas")
@CrossOrigin(origins = "*")
public class TriageAlertaController {

    @Autowired
    private ITriageAlertaService triageAlertaService;

    @GetMapping
    public ResponseEntity<List<TriageAlertaEntity>> getAll() {
        return ResponseEntity.ok(triageAlertaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TriageAlertaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(triageAlertaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TriageAlertaEntity> create(@RequestBody TriageAlertaEntity triageAlerta) {
        return new ResponseEntity<>(triageAlertaService.save(triageAlerta), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TriageAlertaEntity> update(@PathVariable Long id, @RequestBody TriageAlertaEntity triageAlerta) {
        triageAlerta.setId(id);
        return ResponseEntity.ok(triageAlertaService.update(triageAlerta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        triageAlertaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lote")
    public ResponseEntity<Void> guardarRespuestas(@RequestBody com.example.emergencia.dto.TriageRequest request) {
        triageAlertaService.guardarRespuestas(request);
        return ResponseEntity.ok().build();
    }
}
