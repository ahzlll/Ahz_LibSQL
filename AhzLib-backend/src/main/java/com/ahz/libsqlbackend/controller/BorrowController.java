package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.service.BorrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    public static class BorrowRequest {
        public String readerNo;
        public String barcode;
    }

    public static class ReturnRequest {
        public String readerNo;
        public String barcode;
        public boolean lostOrDamaged;
        public double extraFine;
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrow(@RequestBody BorrowRequest request) {
        try {
            String msg = borrowService.borrowBook(request.readerNo, request.barcode);
            return ResponseEntity.ok(msg);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/return")
    public ResponseEntity<?> returnBook(@RequestBody ReturnRequest request) {
        try {
            double fine = borrowService.returnBook(
                    request.readerNo,
                    request.barcode,
                    request.lostOrDamaged,
                    request.extraFine
            );
            return ResponseEntity.ok("归还成功，应罚款：" + fine + " 元");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}


