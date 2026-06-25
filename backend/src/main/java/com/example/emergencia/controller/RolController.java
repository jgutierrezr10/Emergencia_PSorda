package com.example.emergencia.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.example.emergencia.entity.RolEntity;
import com.example.emergencia.interfaces.IRolService;

@RestController
@RequestMapping("roles")
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {

    @Autowired
    private IRolService rolService;

    @GetMapping
    public List<RolEntity> findAll() {
        return rolService.findAll();
    }

    @GetMapping("{id}")
    public RolEntity findById(@PathVariable Long id) {
        return rolService.findById(id);
    }

    @PostMapping
    public RolEntity save(@Valid @RequestBody RolEntity rol) {
        return rolService.save(rol);
    }

    @PutMapping("{id}")
    public RolEntity update(@PathVariable Long id, @Valid @RequestBody RolEntity rol) {
        rol.setId(id);
        return rolService.update(rol);
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id) {
        rolService.delete(id);
    }
}
