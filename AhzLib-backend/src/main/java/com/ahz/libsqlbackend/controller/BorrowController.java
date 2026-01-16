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
            BorrowService.ReturnResult result = borrowService.returnBook(
                    request.readerNo,
                    request.barcode,
                    request.lostOrDamaged,
                    request.extraFine
            );
            if (result.getFine() > 0) {
                StringBuilder message = new StringBuilder("归还成功，需缴纳罚款：");
                message.append(String.format("%.2f", result.getFine())).append(" 元");
                
                // 构建罚款原因说明
                StringBuilder reason = new StringBuilder("（");
                boolean hasReason = false;
                if (result.isOverdue()) {
                    reason.append("因逾期需缴纳罚款");
                    hasReason = true;
                }
                if (result.isLost()) {
                    if (hasReason) {
                        reason.append("、因损失需缴纳罚款");
                    } else {
                        reason.append("因损失需缴纳罚款");
                    }
                    hasReason = true;
                }
                if (hasReason) {
                    message.append(reason).append("）");
                }
                
                return ResponseEntity.ok(message.toString());
            } else {
                return ResponseEntity.ok("归还成功");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}


