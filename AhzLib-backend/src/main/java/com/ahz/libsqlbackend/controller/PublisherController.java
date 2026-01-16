package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Publisher;
import com.ahz.libsqlbackend.repository.BookRepository;
import com.ahz.libsqlbackend.repository.PublisherRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@SuppressWarnings("null")
public class PublisherController {

    private final PublisherRepository publisherRepository;
    private final BookRepository bookRepository;

    public PublisherController(PublisherRepository publisherRepository,
                              BookRepository bookRepository) {
        this.publisherRepository = publisherRepository;
        this.bookRepository = bookRepository;
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
        
        // 检查是否有图书使用该出版社
        long bookCount = bookRepository.countByPublisherId(id);
        if (bookCount > 0) {
            return ResponseEntity.badRequest().body("该出版社正在被 " + bookCount + " 本图书使用，不能删除。请先修改或删除相关图书。");
        }
        
        try {
            publisherRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("该出版社存在关联数据，不能删除");
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
        }
    }
}


