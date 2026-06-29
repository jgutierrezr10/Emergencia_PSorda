package com.example.emergencia.interfaces;

import com.example.emergencia.entity.PatrullaEntity;
import java.util.List;

public interface IPatrullaService {
    List<PatrullaEntity> findAll();
    PatrullaEntity findById(Long id);
    PatrullaEntity save(PatrullaEntity patrulla);
    PatrullaEntity update(PatrullaEntity patrulla);
    void delete(Long id);
}
