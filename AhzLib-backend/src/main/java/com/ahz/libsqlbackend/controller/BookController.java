package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Book;
import com.ahz.libsqlbackend.repository.BookCopyRepository;
import com.ahz.libsqlbackend.repository.BookRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@SuppressWarnings("null")
public class BookController {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookController(BookRepository bookRepository,
                         BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
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
        // 处理关联实体，如果ID为null则设置为null
        if (book.getPublisher() != null && book.getPublisher().getId() == null) {
            book.setPublisher(null);
        }
        if (book.getAuthor() != null && book.getAuthor().getId() == null) {
            book.setAuthor(null);
        }
        return bookRepository.save(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Book input) {
        return bookRepository.findById(id)
                .map(db -> {
                    db.setIsbn(input.getIsbn());
                    db.setTitle(input.getTitle());
                    // 处理关联实体，如果ID为null则设置为null
                    if (input.getPublisher() != null && input.getPublisher().getId() != null) {
                    db.setPublisher(input.getPublisher());
                    } else {
                        db.setPublisher(null);
                    }
                    db.setPublishYear(input.getPublishYear());
                    db.setCategory(input.getCategory());
                    if (input.getAuthor() != null && input.getAuthor().getId() != null) {
                    db.setAuthor(input.getAuthor());
                    } else {
                        db.setAuthor(null);
                    }
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
        
        // 检查是否有馆藏本使用该图书
        long bookCopyCount = bookCopyRepository.countByBookId(id);
        if (bookCopyCount > 0) {
            return ResponseEntity.badRequest().body("该图书存在 " + bookCopyCount + " 本馆藏，不能删除。请先删除相关馆藏。");
        }
        
        try {
            bookRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("该图书存在关联数据，不能删除");
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
        }
    }
}


