package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Book;
import com.ahz.libsqlbackend.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@SuppressWarnings("null")
public class BookController {

    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> list() {
        return bookRepository.findAll();
    }

    @PostMapping
    public Book create(@RequestBody Book book) {
        if (book.getTotalCopy() == null) {
            book.setTotalCopy(0);
        }
        if (book.getAvailableCopy() == null) {
            book.setAvailableCopy(0);
        }
        if (book.getStatus() == null) {
            book.setStatus(1);
        }
        return bookRepository.save(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Book input) {
        return bookRepository.findById(id)
                .map(db -> {
                    db.setIsbn(input.getIsbn());
                    db.setTitle(input.getTitle());
                    db.setPublisher(input.getPublisher());
                    db.setPublishYear(input.getPublishYear());
                    db.setCategory(input.getCategory());
                    db.setAuthor(input.getAuthor());
                    db.setTotalCopy(input.getTotalCopy());
                    db.setAvailableCopy(input.getAvailableCopy());
                    db.setStatus(input.getStatus());
                    return ResponseEntity.ok(bookRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}


