package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readers")
public class ReaderController {

    private final ReaderRepository readerRepository;

    public ReaderController(ReaderRepository readerRepository) {
        this.readerRepository = readerRepository;
    }

    @GetMapping
    public List<Reader> list() {
        return readerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reader> get(@PathVariable Long id) {
        return readerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Reader create(@RequestBody Reader reader) {
        if (reader.getBorrowedCount() == null) {
            reader.setBorrowedCount(0);
        }
        if (reader.getTotalFine() == null) {
            reader.setTotalFine(0.0);
        }
        if (reader.getStatus() == null) {
            reader.setStatus(1);
        }
        return readerRepository.save(reader);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reader> update(@PathVariable Long id, @RequestBody Reader input) {
        return readerRepository.findById(id)
                .map(db -> {
                    db.setReaderNo(input.getReaderNo());
                    db.setName(input.getName());
                    db.setGender(input.getGender());
                    db.setPhone(input.getPhone());
                    db.setEmail(input.getEmail());
                    db.setReaderType(input.getReaderType());
                    db.setStatus(input.getStatus());
                    return ResponseEntity.ok(readerRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return readerRepository.findById(id)
                .map(db -> {
                    if (db.getBorrowedCount() != null && db.getBorrowedCount() > 0) {
                        return ResponseEntity.badRequest().body("该读者仍有未归还图书，不能删除");
                    }
                    readerRepository.delete(db);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}


