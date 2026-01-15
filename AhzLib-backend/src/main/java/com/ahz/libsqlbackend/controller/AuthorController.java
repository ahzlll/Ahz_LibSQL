package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Author;
import com.ahz.libsqlbackend.repository.AuthorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorRepository authorRepository;

    public AuthorController(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @GetMapping
    public List<Author> list() {
        return authorRepository.findAll();
    }

    @PostMapping
    public Author create(@RequestBody Author author) {
        return authorRepository.save(author);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Author> update(@PathVariable Long id, @RequestBody Author input) {
        return authorRepository.findById(id)
                .map(db -> {
                    db.setName(input.getName());
                    db.setCountry(input.getCountry());
                    db.setRemark(input.getRemark());
                    return ResponseEntity.ok(authorRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!authorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        authorRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}


