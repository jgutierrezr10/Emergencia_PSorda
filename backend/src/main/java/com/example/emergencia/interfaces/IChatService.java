package com.example.emergencia.interfaces;

import com.example.emergencia.entity.ChatEntity;
import java.util.List;

public interface IChatService {
    List<ChatEntity> findAll();
    ChatEntity findById(Long id);
    ChatEntity save(ChatEntity chat);
    ChatEntity update(ChatEntity chat);
    void delete(Long id);
    List<ChatEntity> findByAlertaId(Long alertaId);
}
