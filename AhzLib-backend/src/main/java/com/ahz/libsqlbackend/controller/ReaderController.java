package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.repository.BorrowRecordRepository;
import com.ahz.libsqlbackend.repository.FinePaymentRepository;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readers")
@SuppressWarnings("null")
public class ReaderController {

    private final ReaderRepository readerRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FinePaymentRepository finePaymentRepository;

    public ReaderController(ReaderRepository readerRepository,
                           BorrowRecordRepository borrowRecordRepository,
                           FinePaymentRepository finePaymentRepository) {
        this.readerRepository = readerRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.finePaymentRepository = finePaymentRepository;
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
        // 处理关联实体，如果ID为null则设置为null
        if (reader.getReaderType() != null && reader.getReaderType().getId() == null) {
            reader.setReaderType(null);
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
                    // 处理关联实体，如果ID为null则设置为null
                    if (input.getReaderType() != null && input.getReaderType().getId() != null) {
                        db.setReaderType(input.getReaderType());
                    } else {
                        db.setReaderType(null);
                    }
                    db.setStatus(input.getStatus());
                    return ResponseEntity.ok(readerRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return readerRepository.findById(id)
                .map(db -> {
                    // 检查是否有未归还的图书
                    if (db.getBorrowedCount() != null && db.getBorrowedCount() > 0) {
                        return ResponseEntity.badRequest().body("该读者仍有未归还图书，不能删除");
                    }
                    
                    // 检查是否有未归还的借阅记录
                    List<com.ahz.libsqlbackend.entity.BorrowRecord> unreturnedRecords = 
                            borrowRecordRepository.findByReaderIdAndStatus(id, "BORROWED");
                    if (!unreturnedRecords.isEmpty()) {
                        return ResponseEntity.badRequest().body("该读者仍有未归还图书，不能删除");
                    }
                    
                    // 检查是否有任何借阅记录（历史记录）
                    long borrowRecordCount = borrowRecordRepository.countByReaderId(id);
                    if (borrowRecordCount > 0) {
                        return ResponseEntity.badRequest().body("该读者存在借阅历史记录（" + borrowRecordCount + "条），不能删除。如需删除，请先删除相关借阅记录。");
                    }
                    
                    // 检查是否有罚款缴费记录
                    long finePaymentCount = finePaymentRepository.countByReaderId(id);
                    if (finePaymentCount > 0) {
                        return ResponseEntity.badRequest().body("该读者存在罚款缴费记录（" + finePaymentCount + "条），不能删除。如需删除，请先删除相关缴费记录。");
                    }
                    
                    try {
                        readerRepository.delete(db);
                        return ResponseEntity.ok().build();
                    } catch (DataIntegrityViolationException e) {
                        // 捕获外键约束异常
                        return ResponseEntity.badRequest().body("该读者存在关联数据（借阅记录或缴费记录），不能删除");
                    } catch (Exception e) {
                        // 其他异常
                        String errorMsg = e.getMessage();
                        return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
                    }
                }).orElse(ResponseEntity.notFound().build());
    }
}


