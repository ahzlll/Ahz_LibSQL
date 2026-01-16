package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    Optional<BookCopy> findByBarcode(String barcode);
    
    List<BookCopy> findByBookId(Long bookId);
    
    long countByBookId(Long bookId);
}


