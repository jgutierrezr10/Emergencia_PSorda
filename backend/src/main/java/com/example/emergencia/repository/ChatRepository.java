package com.example.emergencia.repository;

import com.example.emergencia.entity.ChatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatEntity, Long> {
    List<ChatEntity> findByAlertaIdOrderByFechaHoraEnvioAsc(Long alertaId);
}
