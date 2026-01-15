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
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BorrowService(ReaderRepository readerRepository,
                         BookCopyRepository bookCopyRepository,
                         BookRepository bookRepository,
                         BorrowRecordRepository borrowRecordRepository) {
        this.readerRepository = readerRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
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
        if (book.getAvailableCopy() == null || book.getAvailableCopy() <= 0) {
            throw new RuntimeException("该图书暂无可借库存");
        }

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
        book.setAvailableCopy(book.getAvailableCopy() - 1);
        reader.setBorrowedCount((reader.getBorrowedCount() == null ? 0 : reader.getBorrowedCount()) + 1);

        return "借阅成功，应还日期：" + due.toLocalDate();
    }

    @Transactional
    public double returnBook(String readerNo, String barcode, boolean lostOrDamaged, double extraFine) {
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
        ReaderType type = reader.getReaderType();
        if (now.isAfter(record.getDueDate())) {
            daysOver = Duration.between(record.getDueDate(), now).toDays();
            if (daysOver < 0) {
                daysOver = 0;
            }
            fine += daysOver * type.getFineRatePerDay();
            record.setIsOverdue(1);
        }

        if (lostOrDamaged) {
            fine += extraFine;
            record.setStatus("LOST");
            copy.setStatus("LOST");
        } else {
            record.setStatus("RETURNED");
            copy.setStatus("IN_LIBRARY");
            Book book = copy.getBook();
            book.setAvailableCopy(book.getAvailableCopy() + 1);
        }

        record.setFineAmount(fine);
        reader.setBorrowedCount((reader.getBorrowedCount() == null ? 0 : reader.getBorrowedCount()) - 1);
        reader.setTotalFine((reader.getTotalFine() == null ? 0.0 : reader.getTotalFine()) + fine);

        return fine;
    }
}


