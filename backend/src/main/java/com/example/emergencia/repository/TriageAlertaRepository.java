package com.example.emergencia.repository;

import com.example.emergencia.entity.TriageAlertaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TriageAlertaRepository extends JpaRepository<TriageAlertaEntity, Long> {
}
