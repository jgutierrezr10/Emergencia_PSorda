package com.example.emergencia.services;

import com.example.emergencia.entity.ChatEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IChatService;
import com.example.emergencia.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatServiceImpl implements IChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Override
    public List<ChatEntity> findAll() {
        return chatRepository.findAll();
    }

    @Override
    public ChatEntity findById(Long id) {
        return chatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje de chat no encontrado con ID: " + id));
    }

    @Override
    public ChatEntity save(ChatEntity chat) {
        return chatRepository.save(chat);
    }

    @Override
    public ChatEntity update(ChatEntity chat) {
        ChatEntity existente = findById(chat.getId());
        existente.setTexto(chat.getTexto());
        existente.setFechaHoraEnvio(chat.getFechaHoraEnvio());
        existente.setEmisorId(chat.getEmisorId());
        existente.setAlerta(chat.getAlerta());
        existente.setGif(chat.getGif());
        existente.setTipo(chat.getTipo());
        existente.setArchivoUrl(chat.getArchivoUrl());
        existente.setTipoArchivo(chat.getTipoArchivo());
        return chatRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        ChatEntity existente = findById(id);
        chatRepository.delete(existente);
    }

    @Override
    public List<ChatEntity> findByAlertaId(Long alertaId) {
        return chatRepository.findByAlertaIdOrderByFechaHoraEnvioAsc(alertaId);
    }
}
