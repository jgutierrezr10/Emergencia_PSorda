package com.example.emergencia.controller;

import com.example.emergencia.entity.PatrullaEntity;
import com.example.emergencia.interfaces.IPatrullaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patrullas")
@CrossOrigin(origins = "*")
public class PatrullaController {

    @Autowired
    private IPatrullaService patrullaService;

    @GetMapping
    public ResponseEntity<List<PatrullaEntity>> getAll() {
        return ResponseEntity.ok(patrullaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatrullaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patrullaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PatrullaEntity> create(@RequestBody PatrullaEntity patrulla) {
        return new ResponseEntity<>(patrullaService.save(patrulla), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatrullaEntity> update(@PathVariable Long id, @RequestBody PatrullaEntity patrulla) {
        patrulla.setId(id);
        return ResponseEntity.ok(patrullaService.update(patrulla));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patrullaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
