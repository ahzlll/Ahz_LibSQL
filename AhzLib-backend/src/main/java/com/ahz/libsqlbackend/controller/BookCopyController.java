package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.BookCopy;
import com.ahz.libsqlbackend.repository.BookCopyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-copies")
public class BookCopyController {

    private final BookCopyRepository bookCopyRepository;

    public BookCopyController(BookCopyRepository bookCopyRepository) {
        this.bookCopyRepository = bookCopyRepository;
    }

    @GetMapping
    public List<BookCopy> list() {
        return bookCopyRepository.findAll();
    }

    @PostMapping
    public BookCopy create(@RequestBody BookCopy copy) {
        return bookCopyRepository.save(copy);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookCopy> update(@PathVariable Long id, @RequestBody BookCopy input) {
        return bookCopyRepository.findById(id)
                .map(db -> {
                    db.setBook(input.getBook());
                    db.setBarcode(input.getBarcode());
                    db.setLocation(input.getLocation());
                    db.setStatus(input.getStatus());
                    return ResponseEntity.ok(bookCopyRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return bookCopyRepository.findById(id)
                .map(db -> {
                    if (!"IN_LIBRARY".equals(db.getStatus())) {
                        return ResponseEntity.badRequest().body("仅允许删除在馆状态的馆藏");
                    }
                    bookCopyRepository.delete(db);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}


