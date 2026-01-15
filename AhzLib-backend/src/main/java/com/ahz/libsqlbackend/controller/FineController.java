package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    public static class PayFineRequest {
        public Long readerId;
        public double amount;
        public String remark;
    }

    @PostMapping("/pay")
    public ResponseEntity<?> pay(@RequestBody PayFineRequest request) {
        try {
            fineService.payFine(request.readerId, request.amount, request.remark);
            return ResponseEntity.ok("缴费成功");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}


