package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.FinePayment;
import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.repository.FinePaymentRepository;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import com.ahz.libsqlbackend.service.FineService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;
    private final FinePaymentRepository finePaymentRepository;
    private final ReaderRepository readerRepository;

    public FineController(FineService fineService, FinePaymentRepository finePaymentRepository, ReaderRepository readerRepository) {
        this.fineService = fineService;
        this.finePaymentRepository = finePaymentRepository;
        this.readerRepository = readerRepository;
    }

    public static class PayFineRequest {
        public String readerNo;
        public double amount;
        public String remark;
    }

    public static class FinePaymentDto {
        public Long id;
        public String readerNo;
        public String readerName;
        public Double amount;
        public String payDate;
        public String remark;
    }
    
    public static class UnpaidFineDto {
        public Long readerId;
        public String readerNo;
        public String readerName;
        public String readerTypeName;
        public String phone;
        public Double totalFine;
    }

    private FinePaymentDto toDto(FinePayment fp, DateTimeFormatter formatter) {
        FinePaymentDto dto = new FinePaymentDto();
        dto.id = fp.getId();
        if (fp.getReader() != null) {
            dto.readerNo = fp.getReader().getReaderNo();
            dto.readerName = fp.getReader().getName();
        }
        dto.amount = fp.getAmount();
        dto.payDate = fp.getPayDate() != null ? fp.getPayDate().format(formatter) : null;
        dto.remark = fp.getRemark();
        return dto;
    }

    @PostMapping("/pay")
    public ResponseEntity<?> pay(@RequestBody PayFineRequest request) {
        try {
            fineService.payFine(request.readerNo, request.amount, request.remark);
            return ResponseEntity.ok("缴费成功");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取最近N条罚款记录（默认10条）
     */
    @GetMapping("/recent")
    public List<FinePaymentDto> getRecent(@RequestParam(value = "limit", defaultValue = "10") int limit) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<FinePayment> list = finePaymentRepository.findByOrderByPayDateDesc(
                PageRequest.of(0, limit));
        return list.stream().map(fp -> toDto(fp, formatter)).collect(Collectors.toList());
    }

    /**
     * 按读者搜索罚款记录
     */
    @GetMapping("/search")
    public List<FinePaymentDto> search(@RequestParam("keyword") String keyword) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<FinePayment> list = finePaymentRepository.findByReaderKeyword(keyword);
        return list.stream().map(fp -> toDto(fp, formatter)).collect(Collectors.toList());
    }
    
    /**
     * 获取所有未缴费记录
     */
    @GetMapping("/unpaid")
    public List<UnpaidFineDto> getUnpaidFines() {
        List<Reader> readers = readerRepository.findReadersWithUnpaidFines();
        return readers.stream().map(this::toUnpaidFineDto).collect(Collectors.toList());
    }
    
    /**
     * 按关键字搜索未缴费记录
     */
    @GetMapping("/unpaid/search")
    public List<UnpaidFineDto> searchUnpaidFines(@RequestParam("keyword") String keyword) {
        List<Reader> readers = readerRepository.findReadersWithUnpaidFinesByKeyword(keyword);
        return readers.stream().map(this::toUnpaidFineDto).collect(Collectors.toList());
    }
    
    private UnpaidFineDto toUnpaidFineDto(Reader reader) {
        UnpaidFineDto dto = new UnpaidFineDto();
        dto.readerId = reader.getId();
        dto.readerNo = reader.getReaderNo();
        dto.readerName = reader.getName();
        dto.readerTypeName = reader.getReaderType() != null ? reader.getReaderType().getName() : null;
        dto.phone = reader.getPhone();
        dto.totalFine = reader.getTotalFine() == null ? 0.0 : reader.getTotalFine();
        return dto;
    }
}


