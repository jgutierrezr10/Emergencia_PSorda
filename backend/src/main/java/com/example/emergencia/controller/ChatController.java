package com.example.emergencia.controller;

import com.example.emergencia.entity.ChatEntity;
import com.example.emergencia.interfaces.IChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.example.emergencia.dto.ChatDTO;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private IChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{alertaId}")
    public void handleChatMessage(@DestinationVariable Long alertaId, ChatDTO chatDto) {
        // En un caso real aquí se guarda el mensaje en la BD usando chatService
        // Por ahora, para la demo en vivo, retransmitimos el mensaje a todos en la sala:
        messagingTemplate.convertAndSend("/topic/chat/" + alertaId, chatDto);
    }

    @GetMapping
    public ResponseEntity<List<ChatEntity>> getAll() {
        return ResponseEntity.ok(chatService.findAll());
    }

    @GetMapping("/alerta/{alertaId}")
    public ResponseEntity<List<ChatEntity>> getByAlertaId(@PathVariable Long alertaId) {
        return ResponseEntity.ok(chatService.findByAlertaId(alertaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ChatEntity> create(@RequestBody ChatEntity chat) {
        return new ResponseEntity<>(chatService.save(chat), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChatEntity> update(@PathVariable Long id, @RequestBody ChatEntity chat) {
        chat.setId(id);
        return ResponseEntity.ok(chatService.update(chat));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        chatService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
