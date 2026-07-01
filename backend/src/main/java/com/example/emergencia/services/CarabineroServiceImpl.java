package com.example.emergencia.services;

import com.example.emergencia.entity.CarabineroEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.ICarabineroService;
import com.example.emergencia.repository.CarabineroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarabineroServiceImpl implements ICarabineroService {

    @Autowired
    private CarabineroRepository carabineroRepository;

    @Override
    public List<CarabineroEntity> findAll() {
        return carabineroRepository.findAll();
    }

    @Override
    public CarabineroEntity findById(Long id) {
        return carabineroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carabinero no encontrado con ID: " + id));
    }

    @Override
    public CarabineroEntity save(CarabineroEntity carabinero) {
        return carabineroRepository.save(carabinero);
    }

    @Override
    public CarabineroEntity update(CarabineroEntity carabinero) {
        CarabineroEntity existente = findById(carabinero.getId());
        existente.setNombre(carabinero.getNombre());
        existente.setNumero(carabinero.getNumero());
        existente.setRango(carabinero.getRango());
        existente.setUsuario(carabinero.getUsuario());
        return carabineroRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        CarabineroEntity existente = findById(id);
        carabineroRepository.delete(existente);
    }
}
