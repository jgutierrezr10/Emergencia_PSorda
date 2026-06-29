package com.example.emergencia.services;

import com.example.emergencia.entity.ComisariaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IComisariaService;
import com.example.emergencia.repository.ComisariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComisariaServiceImpl implements IComisariaService {

    @Autowired
    private ComisariaRepository comisariaRepository;

    @Override
    public List<ComisariaEntity> findAll() {
        return comisariaRepository.findAll();
    }

    @Override
    public ComisariaEntity findById(Long id) {
        return comisariaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comisaria no encontrada con ID: " + id));
    }

    @Override
    public ComisariaEntity save(ComisariaEntity comisaria) {
        return comisariaRepository.save(comisaria);
    }

    @Override
    public ComisariaEntity update(ComisariaEntity comisaria) {
        ComisariaEntity existente = findById(comisaria.getId());
        existente.setNombre(comisaria.getNombre());
        existente.setDireccion(comisaria.getDireccion());
        return comisariaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        ComisariaEntity existente = findById(id);
        comisariaRepository.delete(existente);
    }
}
