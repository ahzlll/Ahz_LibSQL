package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Author;
import com.ahz.libsqlbackend.entity.Book;
import com.ahz.libsqlbackend.entity.Publisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@SuppressWarnings("null")
class BookRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookRepository bookRepository;

    private Author testAuthor;
    private Publisher testPublisher;
    private Book testBook;

    @BeforeEach
    void setUp() {
        // 创建测试作者
        testAuthor = new Author();
        testAuthor.setName("测试作者");
        testAuthor.setCountry("中国");
        testAuthor = entityManager.persistAndFlush(testAuthor);

        // 创建测试出版社
        testPublisher = new Publisher();
        testPublisher.setName("测试出版社");
        testPublisher.setAddress("测试地址");
        testPublisher = entityManager.persistAndFlush(testPublisher);

        // 创建测试图书
        testBook = new Book();
        testBook.setIsbn("9781234567890");
        testBook.setTitle("测试图书");
        testBook.setAuthor(testAuthor);
        testBook.setPublisher(testPublisher);
        testBook.setPublishYear(2024);
        testBook.setCategory("测试分类");
        testBook.setTotalCopy(10);
        testBook.setAvailableCopy(10);
        testBook.setStatus(1);
        testBook = entityManager.persistAndFlush(testBook);
    }

    @Test
    void testFindByIsbn() {
        // 测试通过 ISBN 查找图书
        Optional<Book> found = bookRepository.findByIsbn("9781234567890");
        
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("测试图书");
        assertThat(found.get().getIsbn()).isEqualTo("9781234567890");
    }

    @Test
    void testFindByIsbnNotFound() {
        // 测试查找不存在的图书
        Optional<Book> found = bookRepository.findByIsbn("0000000000000");
        
        assertThat(found).isNotPresent();
    }

    @Test
    void testSaveBook() {
        // 测试保存新图书
        Book newBook = new Book();
        newBook.setIsbn("9780987654321");
        newBook.setTitle("新图书");
        newBook.setAuthor(testAuthor);
        newBook.setPublisher(testPublisher);
        newBook.setTotalCopy(5);
        newBook.setAvailableCopy(5);
        newBook.setStatus(1);
        
        Book saved = bookRepository.save(newBook);
        
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getIsbn()).isEqualTo("9780987654321");
    }

    @Test
    void testUpdateBook() {
        // 测试更新图书信息
        testBook.setTitle("更新后的书名");
        testBook.setAvailableCopy(8);
        
        Book updated = bookRepository.save(testBook);
        
        assertThat(updated.getTitle()).isEqualTo("更新后的书名");
        assertThat(updated.getAvailableCopy()).isEqualTo(8);
    }
}

