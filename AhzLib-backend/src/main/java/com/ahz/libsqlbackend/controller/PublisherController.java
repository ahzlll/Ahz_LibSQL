package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Publisher;
import com.ahz.libsqlbackend.repository.PublisherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@SuppressWarnings("null")
public class PublisherController {

    private final PublisherRepository publisherRepository;

    public PublisherController(PublisherRepository publisherRepository) {
        this.publisherRepository = publisherRepository;
    }

    @GetMapping
    public List<Publisher> list() {
        return publisherRepository.findAll();
    }

    @PostMapping
    public Publisher create(@RequestBody Publisher publisher) {
        return publisherRepository.save(publisher);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Publisher> update(@PathVariable Long id, @RequestBody Publisher input) {
        return publisherRepository.findById(id)
                .map(db -> {
                    db.setName(input.getName());
                    db.setAddress(input.getAddress());
                    db.setPhone(input.getPhone());
                    db.setContact(input.getContact());
                    db.setRemark(input.getRemark());
                    return ResponseEntity.ok(publisherRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!publisherRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        publisherRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}


