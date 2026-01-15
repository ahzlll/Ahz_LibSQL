package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.ReaderType;
import com.ahz.libsqlbackend.repository.ReaderTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reader-types")
public class ReaderTypeController {

    private final ReaderTypeRepository readerTypeRepository;

    public ReaderTypeController(ReaderTypeRepository readerTypeRepository) {
        this.readerTypeRepository = readerTypeRepository;
    }

    @GetMapping
    public List<ReaderType> list() {
        return readerTypeRepository.findAll();
    }

    @PostMapping
    public ReaderType create(@RequestBody ReaderType type) {
        return readerTypeRepository.save(type);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReaderType> update(@PathVariable Long id, @RequestBody ReaderType input) {
        return readerTypeRepository.findById(id)
                .map(db -> {
                    db.setName(input.getName());
                    db.setMaxBorrowCount(input.getMaxBorrowCount());
                    db.setMaxBorrowDays(input.getMaxBorrowDays());
                    db.setFineRatePerDay(input.getFineRatePerDay());
                    return ResponseEntity.ok(readerTypeRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!readerTypeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        readerTypeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}


