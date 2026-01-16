package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Author;
import com.ahz.libsqlbackend.repository.AuthorRepository;
import com.ahz.libsqlbackend.repository.BookRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@SuppressWarnings("null")
public class AuthorController {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    public AuthorController(AuthorRepository authorRepository,
                           BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
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
        
        // 检查是否有图书使用该作者
        long bookCount = bookRepository.countByAuthorId(id);
        if (bookCount > 0) {
            return ResponseEntity.badRequest().body("该作者正在被 " + bookCount + " 本图书使用，不能删除。请先修改或删除相关图书。");
        }
        
        try {
            authorRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("该作者存在关联数据，不能删除");
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
        }
    }
}


