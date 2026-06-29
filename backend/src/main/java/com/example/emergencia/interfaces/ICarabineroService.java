package com.example.emergencia.interfaces;

import com.example.emergencia.entity.CarabineroEntity;
import java.util.List;

public interface ICarabineroService {
    List<CarabineroEntity> findAll();
    CarabineroEntity findById(Long id);
    CarabineroEntity save(CarabineroEntity carabinero);
    CarabineroEntity update(CarabineroEntity carabinero);
    void delete(Long id);
}
