package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);
    
    // 查询使用指定出版社的图书数量
    @Query("SELECT COUNT(b) FROM Book b WHERE b.publisher.id = :publisherId")
    long countByPublisherId(@Param("publisherId") Long publisherId);
    
    // 查询使用指定作者的图书数量
    @Query("SELECT COUNT(b) FROM Book b WHERE b.author.id = :authorId")
    long countByAuthorId(@Param("authorId") Long authorId);
}


