package com.example.emergencia.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.emergencia.entity.RolEntity;
import com.example.emergencia.interfaces.IRolService;
import com.example.emergencia.repository.RolRepository;

@Service
public class RolServiceImpl implements IRolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public List<RolEntity> findAll() {
        return rolRepository.findAll();
    }

    @Override
    public RolEntity findById(Long id) {
        return rolRepository.findById(id).orElse(null);
    }

    @Override
    public RolEntity save(RolEntity rol) {
        return rolRepository.save(rol);
    }

    @Override
    public RolEntity update(RolEntity rol) {
        return rolRepository.save(rol);
    }

    @Override
    public void delete(Long id) {
        rolRepository.deleteById(id);
    }

}
