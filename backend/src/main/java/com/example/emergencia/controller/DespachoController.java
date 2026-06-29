package com.example.emergencia.controller;

import com.example.emergencia.entity.DespachoEntity;
import com.example.emergencia.interfaces.IDespachoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/despachos")
@CrossOrigin(origins = "*")
public class DespachoController {

    @Autowired
    private IDespachoService despachoService;

    @GetMapping
    public ResponseEntity<List<DespachoEntity>> getAll() {
        return ResponseEntity.ok(despachoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DespachoEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(despachoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DespachoEntity> create(@RequestBody DespachoEntity despacho) {
        return new ResponseEntity<>(despachoService.save(despacho), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DespachoEntity> update(@PathVariable Long id, @RequestBody DespachoEntity despacho) {
        despacho.setId(id);
        return ResponseEntity.ok(despachoService.update(despacho));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        despachoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
