package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.ReaderType;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import com.ahz.libsqlbackend.repository.ReaderTypeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reader-types")
@SuppressWarnings("null")
public class ReaderTypeController {

    private final ReaderTypeRepository readerTypeRepository;
    private final ReaderRepository readerRepository;

    public ReaderTypeController(ReaderTypeRepository readerTypeRepository,
                                ReaderRepository readerRepository) {
        this.readerTypeRepository = readerTypeRepository;
        this.readerRepository = readerRepository;
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
        
        // 检查是否有读者使用该读者类别
        long readerCount = readerRepository.countByReaderTypeId(id);
        if (readerCount > 0) {
            return ResponseEntity.badRequest().body("该读者类别正在被 " + readerCount + " 位读者使用，不能删除。请先修改或删除相关读者。");
        }
        
        try {
            readerTypeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("该读者类别存在关联数据，不能删除");
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
        }
    }
}


