package com.ahz.libsqlbackend.service;

import com.ahz.libsqlbackend.entity.*;
import com.ahz.libsqlbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class BorrowService {

    private final ReaderRepository readerRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BorrowService(ReaderRepository readerRepository,
                         BookCopyRepository bookCopyRepository,
                         BorrowRecordRepository borrowRecordRepository) {
        this.readerRepository = readerRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Transactional
    public String borrowBook(String readerNo, String barcode) {
        Reader reader = readerRepository.findByReaderNo(readerNo)
                .orElseThrow(() -> new RuntimeException("读者不存在"));
        if (reader.getStatus() == null || reader.getStatus() != 1) {
            throw new RuntimeException("读者状态异常，不能借书");
        }

        ReaderType type = reader.getReaderType();
        if (type == null) {
            throw new RuntimeException("读者类别未设置");
        }
        if (reader.getBorrowedCount() != null
                && reader.getBorrowedCount() >= type.getMaxBorrowCount()) {
            throw new RuntimeException("已达最大借阅数量");
        }

        BookCopy copy = bookCopyRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("馆藏条码不存在"));
        if (!"IN_LIBRARY".equals(copy.getStatus())) {
            throw new RuntimeException("该馆藏当前不可借");
        }

        Book book = copy.getBook();
        if (book == null) {
            throw new RuntimeException("馆藏关联的图书信息不存在");
        }
        // 移除对availableCopy的检查，因为已经通过馆藏状态验证了可借性
        // availableCopy字段可能不同步，应该根据实际馆藏状态来判断

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime due = now.plusDays(type.getMaxBorrowDays());

        BorrowRecord record = new BorrowRecord();
        record.setReader(reader);
        record.setBookCopy(copy);
        record.setBorrowDate(now);
        record.setDueDate(due);
        record.setStatus("BORROWED");
        record.setFineAmount(0.0);
        record.setIsOverdue(0);
        borrowRecordRepository.save(record);

        copy.setStatus("BORROWED");
        // 更新可借册数，如果为null则初始化为0
        int currentAvailable = book.getAvailableCopy() == null ? 0 : book.getAvailableCopy();
        book.setAvailableCopy(Math.max(0, currentAvailable - 1));
        reader.setBorrowedCount((reader.getBorrowedCount() == null ? 0 : reader.getBorrowedCount()) + 1);

        return "借阅成功，应还日期：" + due.toLocalDate();
    }

    public static class ReturnResult {
        private double fine;
        private boolean isOverdue;
        private boolean isLost;

        public ReturnResult(double fine, boolean isOverdue, boolean isLost) {
            this.fine = fine;
            this.isOverdue = isOverdue;
            this.isLost = isLost;
        }

        public double getFine() {
            return fine;
        }

        public boolean isOverdue() {
            return isOverdue;
        }

        public boolean isLost() {
            return isLost;
        }
    }

    @Transactional
    public ReturnResult returnBook(String readerNo, String barcode, boolean lostOrDamaged, double extraFine) {
        Reader reader = readerRepository.findByReaderNo(readerNo)
                .orElseThrow(() -> new RuntimeException("读者不存在"));
        BookCopy copy = bookCopyRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("馆藏条码不存在"));

        BorrowRecord record = borrowRecordRepository
                .findByReaderIdAndBookCopyIdAndStatus(reader.getId(), copy.getId(), "BORROWED")
                .orElseThrow(() -> new RuntimeException("未找到对应未归还记录"));

        LocalDateTime now = LocalDateTime.now();
        record.setReturnDate(now);

        long daysOver = 0;
        double fine = 0.0;
        boolean isOverdue = false;
        ReaderType type = reader.getReaderType();
        if (type == null) {
            throw new RuntimeException("读者类别未设置");
        }
        if (now.isAfter(record.getDueDate())) {
            daysOver = Duration.between(record.getDueDate(), now).toDays();
            if (daysOver < 0) {
                daysOver = 0;
            }
            fine += daysOver * type.getFineRatePerDay();
            record.setIsOverdue(1);
            isOverdue = true;
        } else {
            record.setIsOverdue(0);
        }

        // 无论是否损坏，都要加上额外罚款（如果有）
        if (extraFine > 0) {
            fine += extraFine;
        }
        
        if (lostOrDamaged) {
            record.setStatus("LOST");
            copy.setStatus("LOST");
        } else {
            record.setStatus("RETURNED");
            copy.setStatus("IN_LIBRARY");
            Book book = copy.getBook();
            if (book != null) {
                int currentAvailable = book.getAvailableCopy() == null ? 0 : book.getAvailableCopy();
                book.setAvailableCopy(currentAvailable + 1);
            }
        }

        record.setFineAmount(fine);
        // 保存借阅记录，确保罚款金额和状态更新到数据库
        borrowRecordRepository.save(record);
        
        reader.setBorrowedCount((reader.getBorrowedCount() == null ? 0 : reader.getBorrowedCount()) - 1);
        // 更新读者的总罚款，确保保存到数据库
        double currentTotalFine = reader.getTotalFine() == null ? 0.0 : reader.getTotalFine();
        reader.setTotalFine(currentTotalFine + fine);
        // 显式保存读者信息，确保totalFine更新到数据库
        readerRepository.save(reader);
        
        // 注意：归还时产生的罚款只更新 totalFine，不创建 FinePayment 记录
        // FinePayment 应该只记录已缴费的记录，只有用户缴费时才创建 FinePayment
        // 归还时产生的罚款信息保存在 BorrowRecord.fineAmount 中

        return new ReturnResult(fine, isOverdue, lostOrDamaged);
    }
}


