package com.example.emergencia.controller;

import com.example.emergencia.entity.ChatEntity;
import com.example.emergencia.interfaces.IChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private IChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatEntity>> getAll() {
        return ResponseEntity.ok(chatService.findAll());
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
