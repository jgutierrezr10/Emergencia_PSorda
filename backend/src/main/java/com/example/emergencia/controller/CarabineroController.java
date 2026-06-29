package com.example.emergencia.controller;

import com.example.emergencia.entity.CarabineroEntity;
import com.example.emergencia.interfaces.ICarabineroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carabineros")
@CrossOrigin(origins = "*")
public class CarabineroController {

    @Autowired
    private ICarabineroService carabineroService;

    @GetMapping
    public ResponseEntity<List<CarabineroEntity>> getAll() {
        return ResponseEntity.ok(carabineroService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarabineroEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(carabineroService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CarabineroEntity> create(@RequestBody CarabineroEntity carabinero) {
        return new ResponseEntity<>(carabineroService.save(carabinero), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarabineroEntity> update(@PathVariable Long id, @RequestBody CarabineroEntity carabinero) {
        carabinero.setId(id);
        return ResponseEntity.ok(carabineroService.update(carabinero));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        carabineroService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
