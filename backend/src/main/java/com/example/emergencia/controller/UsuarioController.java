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

import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.interfaces.IUsuarioService;

@RestController
@RequestMapping("usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private IUsuarioService usuarioService;

    @GetMapping
    public List<UsuarioEntity> findAll() {
        return usuarioService.findAll();
    }

    @GetMapping("{id}")
    public UsuarioEntity findById(@PathVariable Long id) {
        return usuarioService.findById(id);
    }

    @PostMapping
    public UsuarioEntity save(@Valid @RequestBody UsuarioEntity usuario) {
        return usuarioService.save(usuario);
    }

    @PutMapping("{id}")
    public UsuarioEntity update(@PathVariable Long id, @Valid @RequestBody UsuarioEntity usuario) {
        usuario.setId(id);
        return usuarioService.update(usuario);
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id) {
        usuarioService.delete(id);
    }

    @GetMapping("/rut/{rut}")
    public UsuarioEntity findByRut(@PathVariable String rut) {
        return usuarioService.findByRut(rut);
    }

    @GetMapping("/pendientes")
    public List<UsuarioEntity> findPendientes() {
        return usuarioService.findByEstado("Pendiente");
    }

    @PutMapping("/{id}/estado")
    public UsuarioEntity updateEstado(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        UsuarioEntity usuario = usuarioService.findById(id);
        if (body.containsKey("estado")) {
            usuario.setEstado(body.get("estado"));
            return usuarioService.update(usuario);
        }
        return usuario;
    }
}
