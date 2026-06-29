package com.example.emergencia.repository;

import com.example.emergencia.entity.TriageAlertaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TriageAlertaRepository extends JpaRepository<TriageAlertaEntity, Long> {
    List<TriageAlertaEntity> findByAlertaIdOrderByHoraRespuestaAsc(Long alertaId);
}
