package com.example.emergencia.services;

import com.example.emergencia.entity.CatalogoGifEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.ICatalogoGifService;
import com.example.emergencia.repository.CatalogoGifRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogoGifServiceImpl implements ICatalogoGifService {

    @Autowired
    private CatalogoGifRepository catalogoGifRepository;

    @Override
    public List<CatalogoGifEntity> findAll() {
        return catalogoGifRepository.findAll();
    }

    @Override
    public CatalogoGifEntity findById(Long id) {
        return catalogoGifRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gif no encontrado con ID: " + id));
    }

    @Override
    public CatalogoGifEntity save(CatalogoGifEntity catalogoGif) {
        return catalogoGifRepository.save(catalogoGif);
    }

    @Override
    public CatalogoGifEntity update(CatalogoGifEntity catalogoGif) {
        CatalogoGifEntity existente = findById(catalogoGif.getId());
        existente.setUrl(catalogoGif.getUrl());
        existente.setRuta(catalogoGif.getRuta());
        existente.setCategoria(catalogoGif.getCategoria());
        existente.setDescripcionTexto(catalogoGif.getDescripcionTexto());
        return catalogoGifRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        CatalogoGifEntity existente = findById(id);
        catalogoGifRepository.delete(existente);
    }
}
