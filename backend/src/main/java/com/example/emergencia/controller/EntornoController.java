package com.example.emergencia.controller;

import com.example.emergencia.entity.EntornoEntity;
import com.example.emergencia.interfaces.IEntornoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entornos")
@CrossOrigin(origins = "*")
public class EntornoController {

    @Autowired
    private IEntornoService entornoService;

    @GetMapping
    public ResponseEntity<List<EntornoEntity>> getAll() {
        return ResponseEntity.ok(entornoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntornoEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(entornoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EntornoEntity> create(@RequestBody EntornoEntity entorno) {
        return new ResponseEntity<>(entornoService.save(entorno), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntornoEntity> update(@PathVariable Long id, @RequestBody EntornoEntity entorno) {
        entorno.setId(id);
        return ResponseEntity.ok(entornoService.update(entorno));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entornoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{rut}")
    public ResponseEntity<List<EntornoEntity>> getByRut(@PathVariable String rut) {
        return ResponseEntity.ok(entornoService.buscarPorRut(rut));
    }

    @PostMapping("/usuario/{rut}")
    public ResponseEntity<EntornoEntity> createForRut(@PathVariable String rut, @RequestBody EntornoEntity entorno) {
        return new ResponseEntity<>(entornoService.crearParaRut(rut, entorno), HttpStatus.CREATED);
    }
}
