package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReaderRepository extends JpaRepository<Reader, Long> {

    Optional<Reader> findByReaderNo(String readerNo);
    
    // 查询有未缴费罚款的读者（totalFine > 0）
    @Query("SELECT r FROM Reader r WHERE (r.totalFine IS NOT NULL AND r.totalFine > 0) ORDER BY r.totalFine DESC")
    List<Reader> findReadersWithUnpaidFines();
    
    // 按关键字搜索有未缴费罚款的读者
    @Query("SELECT r FROM Reader r WHERE (r.totalFine IS NOT NULL AND r.totalFine > 0) AND " +
           "(r.readerNo LIKE %:keyword% OR r.name LIKE %:keyword%) ORDER BY r.totalFine DESC")
    List<Reader> findReadersWithUnpaidFinesByKeyword(@Param("keyword") String keyword);
    
    // 查询使用指定读者类别的读者数量
    @Query("SELECT COUNT(r) FROM Reader r WHERE r.readerType.id = :readerTypeId")
    long countByReaderTypeId(@Param("readerTypeId") Long readerTypeId);
}


