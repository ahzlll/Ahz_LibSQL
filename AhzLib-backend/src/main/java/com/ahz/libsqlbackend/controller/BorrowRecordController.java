package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.BorrowRecord;
import com.ahz.libsqlbackend.repository.BorrowRecordRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/borrow-records")
public class BorrowRecordController {

    private final BorrowRecordRepository borrowRecordRepository;

    public BorrowRecordController(BorrowRecordRepository borrowRecordRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
    }

    public static class BorrowRecordDto {
        public Long id;
        public String readerNo;
        public String readerName;
        public String bookIsbn;
        public String bookTitle;
        public String barcode;
        public String borrowDate;
        public String dueDate;
        public String returnDate;
        public String status;
        public Double fineAmount;
        public Integer isOverdue;
    }

    private BorrowRecordDto toDto(BorrowRecord r, DateTimeFormatter formatter) {
        BorrowRecordDto dto = new BorrowRecordDto();
        dto.id = r.getId();
        if (r.getReader() != null) {
            dto.readerNo = r.getReader().getReaderNo();
            dto.readerName = r.getReader().getName();
        }
        if (r.getBookCopy() != null) {
            dto.barcode = r.getBookCopy().getBarcode();
            if (r.getBookCopy().getBook() != null) {
                dto.bookIsbn = r.getBookCopy().getBook().getIsbn();
                dto.bookTitle = r.getBookCopy().getBook().getTitle();
            }
        }
        dto.borrowDate = r.getBorrowDate() != null ? r.getBorrowDate().format(formatter) : null;
        dto.dueDate = r.getDueDate() != null ? r.getDueDate().format(formatter) : null;
        dto.returnDate = r.getReturnDate() != null ? r.getReturnDate().format(formatter) : null;
        dto.status = r.getStatus();
        dto.fineAmount = r.getFineAmount();
        dto.isOverdue = r.getIsOverdue();
        return dto;
    }

    /**
     * 按读者搜索借阅记录（支持按证号或姓名模糊查询）
     */
    @GetMapping("/search-by-reader")
    public List<BorrowRecordDto> searchByReader(@RequestParam("keyword") String keyword) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BorrowRecord> list = borrowRecordRepository
                .findByReaderReaderNoContainingIgnoreCaseOrReaderNameContainingIgnoreCaseOrderByBorrowDateDesc(
                        keyword, keyword);
        return list.stream().map(r -> toDto(r, formatter)).collect(Collectors.toList());
    }

    /**
     * 按图书搜索借阅记录（支持按ISBN或书名模糊查询）
     */
    @GetMapping("/search-by-book")
    public List<BorrowRecordDto> searchByBook(@RequestParam("keyword") String keyword) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BorrowRecord> list = borrowRecordRepository
                .findByBookCopyBookIsbnContainingIgnoreCaseOrBookCopyBookTitleContainingIgnoreCaseOrderByBorrowDateDesc(
                        keyword, keyword);
        return list.stream().map(r -> toDto(r, formatter)).collect(Collectors.toList());
    }

    /**
     * 查询未归还的记录（按读者搜索）
     */
    @GetMapping("/search-unreturned-by-reader")
    public List<BorrowRecordDto> searchUnreturnedByReader(@RequestParam("keyword") String keyword) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BorrowRecord> list = borrowRecordRepository.findUnreturnedByReaderKeyword(keyword);
        return list.stream().map(r -> toDto(r, formatter)).collect(Collectors.toList());
    }

    /**
     * 查询未归还的记录（按图书搜索）
     */
    @GetMapping("/search-unreturned-by-book")
    public List<BorrowRecordDto> searchUnreturnedByBook(@RequestParam("keyword") String keyword) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BorrowRecord> list = borrowRecordRepository.findUnreturnedByBookKeyword(keyword);
        return list.stream().map(r -> toDto(r, formatter)).collect(Collectors.toList());
    }

    /**
     * 查询所有未归还的记录（按借阅日期升序，最久的在前）
     */
    @GetMapping("/unreturned")
    public List<BorrowRecordDto> getAllUnreturned() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<BorrowRecord> list = borrowRecordRepository.findByStatusOrderByBorrowDateAsc("BORROWED");
        return list.stream().map(r -> toDto(r, formatter)).collect(Collectors.toList());
    }

    public static class PaginatedResponse {
        public List<BorrowRecordDto> content;
        public int totalPages;
        public long totalElements;
        public int currentPage;
        public int pageSize;

        public PaginatedResponse(List<BorrowRecordDto> content, int totalPages, long totalElements, int currentPage, int pageSize) {
            this.content = content;
            this.totalPages = totalPages;
            this.totalElements = totalElements;
            this.currentPage = currentPage;
            this.pageSize = pageSize;
        }
    }

    /**
     * 获取最近500条借阅记录（分页）
     * 默认显示第1页（最近10条）
     * 可以选择每页50条，共10页（500条）
     */
    @GetMapping("/recent")
    public PaginatedResponse getRecent(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        // 限制最多查询500条
        int maxTotal = 500;
        int maxPageSize = 50;
        
        // 如果size超过50，限制为50
        if (size > maxPageSize) {
            size = maxPageSize;
        }
        
        // 总是查询最多500条记录
        List<BorrowRecord> allRecords = borrowRecordRepository.findRecentRecords(PageRequest.of(0, maxTotal));
        
        // 限制实际记录数不超过500
        if (allRecords.size() > maxTotal) {
            allRecords = allRecords.subList(0, maxTotal);
        }
        
        // 计算分页信息
        long totalElements = allRecords.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // 限制页码范围
        if (page < 0) {
            page = 0;
        }
        if (page >= totalPages && totalPages > 0) {
            page = totalPages - 1;
        }
        
        // 分页切片
        int start = page * size;
        int end = Math.min(start + size, allRecords.size());
        
        List<BorrowRecord> pageRecords;
        if (start >= allRecords.size()) {
            pageRecords = new java.util.ArrayList<>();
        } else {
            pageRecords = allRecords.subList(start, end);
        }
        
        List<BorrowRecordDto> content = pageRecords.stream()
                .map(r -> toDto(r, formatter))
                .collect(Collectors.toList());
        
        return new PaginatedResponse(content, totalPages, totalElements, page, size);
    }
}


