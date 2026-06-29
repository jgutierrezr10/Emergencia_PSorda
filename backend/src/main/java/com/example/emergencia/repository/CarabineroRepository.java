package com.example.emergencia.repository;

import com.example.emergencia.entity.CarabineroEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarabineroRepository extends JpaRepository<CarabineroEntity, Long> {
}
