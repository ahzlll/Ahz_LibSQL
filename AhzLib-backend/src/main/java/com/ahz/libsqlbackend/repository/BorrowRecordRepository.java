package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    Optional<BorrowRecord> findByReaderIdAndBookCopyIdAndStatus(Long readerId, Long bookCopyId, String status);

    List<BorrowRecord> findByReaderIdAndStatus(Long readerId, String status);

    List<BorrowRecord> findByReaderReaderNoContainingIgnoreCaseOrReaderNameContainingIgnoreCaseOrderByBorrowDateDesc(
            String readerNoKeyword, String readerNameKeyword);

    List<BorrowRecord> findByBookCopyBookIsbnContainingIgnoreCaseOrBookCopyBookTitleContainingIgnoreCaseOrderByBorrowDateDesc(
            String isbnKeyword, String titleKeyword);

    // 查询所有未归还的记录（按借阅日期升序，最久的在前）
    List<BorrowRecord> findByStatusOrderByBorrowDateAsc(String status);

    // 查询未归还的记录（按读者搜索，按借阅日期升序）
    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED' AND " +
           "(br.reader.readerNo LIKE %:keyword% OR br.reader.name LIKE %:keyword%) " +
           "ORDER BY br.borrowDate ASC")
    List<BorrowRecord> findUnreturnedByReaderKeyword(@Param("keyword") String keyword);

    // 查询未归还的记录（按图书搜索，按借阅日期升序）
    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED' AND " +
           "(br.bookCopy.book.isbn LIKE %:keyword% OR br.bookCopy.book.title LIKE %:keyword%) " +
           "ORDER BY br.borrowDate ASC")
    List<BorrowRecord> findUnreturnedByBookKeyword(@Param("keyword") String keyword);

    // 查询最近N条借阅记录（按借阅日期降序）
    @Query("SELECT br FROM BorrowRecord br ORDER BY br.borrowDate DESC")
    List<BorrowRecord> findRecentRecords(org.springframework.data.domain.Pageable pageable);
    
    // 查询指定读者的所有借阅记录数量
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.reader.id = :readerId")
    long countByReaderId(@Param("readerId") Long readerId);
    
    // 查询指定馆藏本的所有借阅记录数量
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.bookCopy.id = :bookCopyId")
    long countByBookCopyId(@Param("bookCopyId") Long bookCopyId);
}


