package com.example.emergencia.repository;

import com.example.emergencia.entity.ComisariaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComisariaRepository extends JpaRepository<ComisariaEntity, Long> {
}
