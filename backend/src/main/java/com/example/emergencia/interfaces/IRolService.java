package com.example.emergencia.interfaces;

import java.util.List;

import com.example.emergencia.entity.RolEntity;

public interface IRolService {
    List<RolEntity> findAll();

    RolEntity findById(Long id);

    RolEntity save(RolEntity rol);

    RolEntity update(RolEntity rol);

    void delete(Long id);
}
