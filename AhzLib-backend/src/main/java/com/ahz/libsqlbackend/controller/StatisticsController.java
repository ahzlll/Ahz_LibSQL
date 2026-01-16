package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.repository.BorrowRecordRepository;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final ReaderRepository readerRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public StatisticsController(ReaderRepository readerRepository,
                                BorrowRecordRepository borrowRecordRepository) {
        this.readerRepository = readerRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 未缴费总数（totalFine > 0的读者数量）
        long unpaidCount = readerRepository.findReadersWithUnpaidFines().size();
        stats.put("unpaidCount", unpaidCount);
        
        // 未缴费总金额
        double unpaidTotal = readerRepository.findReadersWithUnpaidFines().stream()
                .mapToDouble(r -> r.getTotalFine() == null ? 0.0 : r.getTotalFine())
                .sum();
        stats.put("unpaidTotal", unpaidTotal);
        
        // 逾期总数（应还日期已过且未归还的记录数）
        LocalDateTime now = LocalDateTime.now();
        long overdueCount = borrowRecordRepository.findByStatusOrderByBorrowDateAsc("BORROWED").stream()
                .filter(record -> record.getDueDate() != null && record.getDueDate().isBefore(now))
                .count();
        stats.put("overdueCount", overdueCount);
        
        return stats;
    }
}

