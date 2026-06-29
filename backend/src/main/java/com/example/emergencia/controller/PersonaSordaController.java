package com.example.emergencia.controller;

import com.example.emergencia.entity.PersonaSordaEntity;
import com.example.emergencia.interfaces.IPersonaSordaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas-sordas")
@CrossOrigin(origins = "*")
public class PersonaSordaController {

    @Autowired
    private IPersonaSordaService personaSordaService;

    @GetMapping
    public ResponseEntity<List<PersonaSordaEntity>> getAll() {
        return ResponseEntity.ok(personaSordaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonaSordaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(personaSordaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PersonaSordaEntity> create(@RequestBody PersonaSordaEntity personaSorda) {
        return new ResponseEntity<>(personaSordaService.save(personaSorda), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonaSordaEntity> update(@PathVariable Long id, @RequestBody PersonaSordaEntity personaSorda) {
        personaSorda.setId(id);
        return ResponseEntity.ok(personaSordaService.update(personaSorda));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        personaSordaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{rut}")
    public ResponseEntity<PersonaSordaEntity> getByUsuarioRut(@PathVariable String rut) {
        return ResponseEntity.ok(personaSordaService.findByUsuarioRut(rut));
    }
}
