package com.example.emergencia.interfaces;

import com.example.emergencia.entity.UsuarioEntity;

import java.util.List;

public interface IUsuarioService {
    List<UsuarioEntity> findAll();

    UsuarioEntity findById(Long id);

    UsuarioEntity save(UsuarioEntity usuario);

    UsuarioEntity update(UsuarioEntity usuario);

    void delete(Long id);
    UsuarioEntity findByRut(String rut);
}
