package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    Optional<BorrowRecord> findByReaderIdAndBookCopyIdAndStatus(Long readerId, Long bookCopyId, String status);

    List<BorrowRecord> findByReaderIdAndStatus(Long readerId, String status);
}


