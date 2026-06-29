package com.example.emergencia.interfaces;

import com.example.emergencia.entity.CatalogoGifEntity;
import java.util.List;

public interface ICatalogoGifService {
    List<CatalogoGifEntity> findAll();
    CatalogoGifEntity findById(Long id);
    CatalogoGifEntity save(CatalogoGifEntity catalogoGif);
    CatalogoGifEntity update(CatalogoGifEntity catalogoGif);
    void delete(Long id);
}
