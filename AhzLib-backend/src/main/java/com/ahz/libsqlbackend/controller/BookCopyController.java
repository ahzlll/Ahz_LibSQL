package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.Book;
import com.ahz.libsqlbackend.entity.BookCopy;
import com.ahz.libsqlbackend.repository.BookCopyRepository;
import com.ahz.libsqlbackend.repository.BookRepository;
import com.ahz.libsqlbackend.repository.BorrowRecordRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/book-copies")
@SuppressWarnings("null")
public class BookCopyController {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BookCopyController(BookCopyRepository bookCopyRepository, 
                              BookRepository bookRepository,
                              BorrowRecordRepository borrowRecordRepository) {
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @GetMapping
    public List<BookCopy> list() {
        return bookCopyRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody BookCopy copy) {
        // 处理关联实体，如果ID为null则报错（book是必填的）
        if (copy.getBook() == null || copy.getBook().getId() == null) {
            return ResponseEntity.badRequest().body("图书ID不能为空");
        }
        
        Long bookId = copy.getBook().getId();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("图书不存在"));
        
        // 检查当前馆藏数量是否已达到总册数
        long currentCopyCount = bookCopyRepository.countByBookId(bookId);
        int totalCopy = book.getTotalCopy() == null ? 0 : book.getTotalCopy();
        
        if (currentCopyCount >= totalCopy) {
            return ResponseEntity.badRequest().body("该图书的馆藏数量已达到总册数（" + totalCopy + "本），无法继续添加");
        }
        
        // 设置默认状态
        if (copy.getStatus() == null || copy.getStatus().isEmpty()) {
            copy.setStatus("IN_LIBRARY");
        }
        
        BookCopy saved = bookCopyRepository.save(copy);
        
        // 更新图书的可用册数（如果新增的馆藏是在馆状态）
        if ("IN_LIBRARY".equals(saved.getStatus())) {
            int currentAvailable = book.getAvailableCopy() == null ? 0 : book.getAvailableCopy();
            book.setAvailableCopy(currentAvailable + 1);
            bookRepository.save(book);
        }
        
        return ResponseEntity.ok(saved);
    }
    
    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<?> createBatch(@RequestBody BatchCreateRequest request) {
        if (request.bookId == null) {
            return ResponseEntity.badRequest().body("图书ID不能为空");
        }
        if (request.count == null || request.count <= 0) {
            return ResponseEntity.badRequest().body("批量添加数量必须大于0");
        }
        if (request.count > 100) {
            return ResponseEntity.badRequest().body("批量添加数量不能超过100");
        }
        
        Book book = bookRepository.findById(request.bookId)
                .orElseThrow(() -> new IllegalArgumentException("图书不存在"));
        
        // 检查当前馆藏数量
        long currentCopyCount = bookCopyRepository.countByBookId(request.bookId);
        int totalCopy = book.getTotalCopy() == null ? 0 : book.getTotalCopy();
        
        if (currentCopyCount + request.count > totalCopy) {
            int remaining = totalCopy - (int)currentCopyCount;
            return ResponseEntity.badRequest().body("该图书最多还能添加 " + remaining + " 本馆藏（总册数：" + totalCopy + "本，当前已有：" + currentCopyCount + "本）");
        }
        
        String status = request.status != null && !request.status.isEmpty() ? request.status : "IN_LIBRARY";
        List<BookCopy> created = new ArrayList<>();
        int addedAvailable = 0;
        
        for (int i = 0; i < request.count; i++) {
            BookCopy copy = new BookCopy();
            copy.setBook(book);
            // 生成条码：如果提供了前缀，使用前缀+序号，否则使用默认格式
            if (request.barcodePrefix != null && !request.barcodePrefix.isEmpty()) {
                copy.setBarcode(request.barcodePrefix + String.format("%04d", currentCopyCount + i + 1));
            } else {
                // 使用时间戳+序号生成唯一条码
                long timestamp = System.currentTimeMillis();
                copy.setBarcode("BC" + String.format("%010d", timestamp % 10000000000L + i));
            }
            copy.setLocation(request.location);
            copy.setStatus(status);
            BookCopy saved = bookCopyRepository.save(copy);
            created.add(saved);
            
            if ("IN_LIBRARY".equals(status)) {
                addedAvailable++;
            }
        }
        
        // 更新图书的可用册数
        if (addedAvailable > 0) {
            int currentAvailable = book.getAvailableCopy() == null ? 0 : book.getAvailableCopy();
            book.setAvailableCopy(currentAvailable + addedAvailable);
            bookRepository.save(book);
        }
        
        return ResponseEntity.ok(created);
    }
    
    public static class BatchCreateRequest {
        public Long bookId;
        public Integer count;
        public String barcodePrefix;
        public String location;
        public String status;
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookCopy> update(@PathVariable Long id, @RequestBody BookCopy input) {
        return bookCopyRepository.findById(id)
                .map(db -> {
                    // 处理关联实体，如果ID为null则报错（book是必填的）
                    if (input.getBook() != null && input.getBook().getId() != null) {
                    db.setBook(input.getBook());
                    } else {
                        throw new IllegalArgumentException("图书ID不能为空");
                    }
                    db.setBarcode(input.getBarcode());
                    db.setLocation(input.getLocation());
                    db.setStatus(input.getStatus());
                    return ResponseEntity.ok(bookCopyRepository.save(db));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return bookCopyRepository.findById(id)
                .map(db -> {
                    // 检查是否有借阅记录使用该馆藏本
                    long borrowRecordCount = borrowRecordRepository.countByBookCopyId(id);
                    if (borrowRecordCount > 0) {
                        return ResponseEntity.badRequest().body("该馆藏存在 " + borrowRecordCount + " 条借阅记录，不能删除。请先删除相关借阅记录。");
                    }
                    
                    if (!"IN_LIBRARY".equals(db.getStatus())) {
                        return ResponseEntity.badRequest().body("仅允许删除在馆状态的馆藏");
                    }
                    
                    Book book = db.getBook();
                    
                    try {
                        bookCopyRepository.delete(db);
                        
                        // 更新图书的可用册数
                        if (book != null && "IN_LIBRARY".equals(db.getStatus())) {
                            int currentAvailable = book.getAvailableCopy() == null ? 0 : book.getAvailableCopy();
                            book.setAvailableCopy(Math.max(0, currentAvailable - 1));
                            bookRepository.save(book);
                        }
                        
                        return ResponseEntity.ok().build();
                    } catch (DataIntegrityViolationException e) {
                        return ResponseEntity.badRequest().body("该馆藏存在关联数据（借阅记录），不能删除");
                    } catch (Exception e) {
                        String errorMsg = e.getMessage();
                        return ResponseEntity.status(500).body("删除失败：" + (errorMsg != null ? errorMsg : e.getClass().getSimpleName()));
                    }
                }).orElse(ResponseEntity.notFound().build());
    }
}


