package com.example.emergencia.controller;

import com.example.emergencia.entity.CatalogoGifEntity;
import com.example.emergencia.interfaces.ICatalogoGifService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo-gifs")
@CrossOrigin(origins = "*")
public class CatalogoGifController {

    @Autowired
    private ICatalogoGifService catalogoGifService;

    @GetMapping
    public ResponseEntity<List<CatalogoGifEntity>> getAll() {
        return ResponseEntity.ok(catalogoGifService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogoGifEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoGifService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CatalogoGifEntity> create(@RequestBody CatalogoGifEntity catalogoGif) {
        return new ResponseEntity<>(catalogoGifService.save(catalogoGif), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogoGifEntity> update(@PathVariable Long id, @RequestBody CatalogoGifEntity catalogoGif) {
        catalogoGif.setId(id);
        return ResponseEntity.ok(catalogoGifService.update(catalogoGif));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        catalogoGifService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
