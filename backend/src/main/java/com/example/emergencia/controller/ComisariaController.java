package com.example.emergencia.controller;

import com.example.emergencia.entity.ComisariaEntity;
import com.example.emergencia.interfaces.IComisariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comisarias")
@CrossOrigin(origins = "*")
public class ComisariaController {

    @Autowired
    private IComisariaService comisariaService;

    @GetMapping
    public ResponseEntity<List<ComisariaEntity>> getAll() {
        return ResponseEntity.ok(comisariaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComisariaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(comisariaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ComisariaEntity> create(@RequestBody ComisariaEntity comisaria) {
        return new ResponseEntity<>(comisariaService.save(comisaria), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComisariaEntity> update(@PathVariable Long id, @RequestBody ComisariaEntity comisaria) {
        comisaria.setId(id);
        return ResponseEntity.ok(comisariaService.update(comisaria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comisariaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
