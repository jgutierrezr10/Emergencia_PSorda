package com.example.emergencia.controller;

import com.example.emergencia.entity.ContactoEmergenciaEntity;
import com.example.emergencia.interfaces.IContactoEmergenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contactos-emergencia")
@CrossOrigin(origins = "*")
public class ContactoEmergenciaController {

    @Autowired
    private IContactoEmergenciaService contactoService;

    @GetMapping
    public ResponseEntity<List<ContactoEmergenciaEntity>> getAll() {
        return ResponseEntity.ok(contactoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactoEmergenciaEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ContactoEmergenciaEntity> create(@RequestBody ContactoEmergenciaEntity contacto) {
        return new ResponseEntity<>(contactoService.save(contacto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactoEmergenciaEntity> update(@PathVariable Long id, @RequestBody ContactoEmergenciaEntity contacto) {
        contacto.setId(id);
        return ResponseEntity.ok(contactoService.update(contacto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{rut}")
    public ResponseEntity<List<ContactoEmergenciaEntity>> getByRut(@PathVariable String rut) {
        return ResponseEntity.ok(contactoService.buscarPorRut(rut));
    }

    @PostMapping("/usuario/{rut}")
    public ResponseEntity<ContactoEmergenciaEntity> createForRut(@PathVariable String rut, @RequestBody ContactoEmergenciaEntity contacto) {
        return new ResponseEntity<>(contactoService.crearParaRut(rut, contacto), HttpStatus.CREATED);
    }
}
