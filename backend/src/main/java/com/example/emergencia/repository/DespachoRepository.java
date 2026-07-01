package com.example.emergencia.repository;

import com.example.emergencia.entity.DespachoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DespachoRepository extends JpaRepository<DespachoEntity, Long> {
    List<DespachoEntity> findByAlertaId(Long alertaId);
}
