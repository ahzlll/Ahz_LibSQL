package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.FinePayment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FinePaymentRepository extends JpaRepository<FinePayment, Long> {

    // 查询最近N条记录
    List<FinePayment> findByOrderByPayDateDesc(Pageable pageable);

    // 按读者搜索（证号或姓名）
    @Query("SELECT fp FROM FinePayment fp WHERE " +
           "(fp.reader.readerNo LIKE %:keyword% OR fp.reader.name LIKE %:keyword%) " +
           "ORDER BY fp.payDate DESC")
    List<FinePayment> findByReaderKeyword(@Param("keyword") String keyword);
    
    // 查询指定读者的罚款缴费记录数量
    @Query("SELECT COUNT(fp) FROM FinePayment fp WHERE fp.reader.id = :readerId")
    long countByReaderId(@Param("readerId") Long readerId);
}


