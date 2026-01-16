package com.ahz.libsqlbackend.service;

import com.ahz.libsqlbackend.entity.*;
import com.ahz.libsqlbackend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(BorrowService.class)
@SuppressWarnings("null")
class BorrowServiceTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    private ReaderType studentType;
    private Reader testReader;
    private Author testAuthor;
    private Publisher testPublisher;
    private Book testBook;
    private BookCopy testBookCopy;

    @BeforeEach
    void setUp() {
        // 创建读者类别
        studentType = new ReaderType();
        studentType.setName("学生");
        studentType.setMaxBorrowCount(5);
        studentType.setMaxBorrowDays(30);
        studentType.setFineRatePerDay(0.50);
        studentType = entityManager.persistAndFlush(studentType);

        // 创建读者
        testReader = new Reader();
        testReader.setReaderNo("R2026001");
        testReader.setName("测试读者");
        testReader.setReaderType(studentType);
        testReader.setBorrowedCount(0);
        testReader.setTotalFine(0.0);
        testReader.setStatus(1);
        testReader = entityManager.persistAndFlush(testReader);

        // 创建作者
        testAuthor = new Author();
        testAuthor.setName("测试作者");
        testAuthor = entityManager.persistAndFlush(testAuthor);

        // 创建出版社
        testPublisher = new Publisher();
        testPublisher.setName("测试出版社");
        testPublisher = entityManager.persistAndFlush(testPublisher);

        // 创建图书
        testBook = new Book();
        testBook.setIsbn("9781234567890");
        testBook.setTitle("测试图书");
        testBook.setAuthor(testAuthor);
        testBook.setPublisher(testPublisher);
        testBook.setTotalCopy(5);
        testBook.setAvailableCopy(5);
        testBook.setStatus(1);
        testBook = entityManager.persistAndFlush(testBook);

        // 创建馆藏本
        testBookCopy = new BookCopy();
        testBookCopy.setBook(testBook);
        testBookCopy.setBarcode("BC0001");
        testBookCopy.setLocation("一楼 A 区");
        testBookCopy.setStatus("IN_LIBRARY");
        testBookCopy = entityManager.persistAndFlush(testBookCopy);
    }

    @Test
    void testBorrowBookSuccess() {
        // 测试成功借书
        String result = borrowService.borrowBook("R2026001", "BC0001");

        assertThat(result).contains("借阅成功");
        
        // 验证馆藏本状态已更新
        BookCopy updatedCopy = bookCopyRepository.findByBarcode("BC0001")
                .orElseThrow(() -> new RuntimeException("馆藏本未找到"));
        assertThat(updatedCopy.getStatus()).isEqualTo("BORROWED");

        // 验证图书可用数量已减少
        Book updatedBook = bookRepository.findById(testBook.getId())
                .orElseThrow(() -> new RuntimeException("图书未找到"));
        assertThat(updatedBook.getAvailableCopy()).isEqualTo(4);

        // 验证读者借阅数量已增加
        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getBorrowedCount()).isEqualTo(1);

        // 验证借阅记录已创建
        BorrowRecord record = borrowRecordRepository
                .findByReaderIdAndBookCopyIdAndStatus(testReader.getId(), testBookCopy.getId(), "BORROWED")
                .orElseThrow(() -> new RuntimeException("借阅记录未找到"));
        assertThat(record).isNotNull();
        assertThat(record.getStatus()).isEqualTo("BORROWED");
    }

    @Test
    void testBorrowBookReaderNotFound() {
        // 测试读者不存在的情况
        assertThatThrownBy(() -> borrowService.borrowBook("NOTEXIST", "BC0001"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("读者不存在");
    }

    @Test
    void testBorrowBookReaderStatusInvalid() {
        // 测试读者状态异常的情况
        testReader.setStatus(0);
        entityManager.persistAndFlush(testReader);

        assertThatThrownBy(() -> borrowService.borrowBook("R2026001", "BC0001"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("读者状态异常");
    }

    @Test
    void testBorrowBookMaxCountReached() {
        // 测试达到最大借阅数量的情况
        testReader.setBorrowedCount(5);
        entityManager.persistAndFlush(testReader);

        assertThatThrownBy(() -> borrowService.borrowBook("R2026001", "BC0001"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("最大借阅数量");
    }

    @Test
    void testBorrowBookCopyNotFound() {
        // 测试馆藏本不存在的情况
        assertThatThrownBy(() -> borrowService.borrowBook("R2026001", "NOTEXIST"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("馆藏条码不存在");
    }

    @Test
    void testBorrowBookCopyNotAvailable() {
        // 测试馆藏本不可借的情况
        testBookCopy.setStatus("BORROWED");
        entityManager.persistAndFlush(testBookCopy);

        assertThatThrownBy(() -> borrowService.borrowBook("R2026001", "BC0001"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("不可借");
    }

    @Test
    void testReturnBookSuccess() {
        // 先借书
        borrowService.borrowBook("R2026001", "BC0001");

        // 测试成功还书
        BorrowService.ReturnResult result = borrowService.returnBook("R2026001", "BC0001", false, 0.0);

        assertThat(result.getFine()).isEqualTo(0.0);

        // 验证馆藏本状态已更新
        BookCopy updatedCopy = bookCopyRepository.findByBarcode("BC0001")
                .orElseThrow(() -> new RuntimeException("馆藏本未找到"));
        assertThat(updatedCopy.getStatus()).isEqualTo("IN_LIBRARY");

        // 验证图书可用数量已恢复
        Book updatedBook = bookRepository.findById(testBook.getId())
                .orElseThrow(() -> new RuntimeException("图书未找到"));
        assertThat(updatedBook.getAvailableCopy()).isEqualTo(5);

        // 验证读者借阅数量已减少
        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getBorrowedCount()).isEqualTo(0);
    }

    @Test
    void testReturnBookOverdue() {
        // 先借书
        borrowService.borrowBook("R2026001", "BC0001");

        // 手动设置借阅记录为超期状态
        BorrowRecord record = borrowRecordRepository
                .findByReaderIdAndBookCopyIdAndStatus(testReader.getId(), testBookCopy.getId(), "BORROWED")
                .orElseThrow(() -> new RuntimeException("借阅记录未找到"));
        record.setDueDate(LocalDateTime.now().minusDays(5)); // 5天前到期
        entityManager.persistAndFlush(record);

        // 测试超期还书
        BorrowService.ReturnResult result = borrowService.returnBook("R2026001", "BC0001", false, 0.0);

        assertThat(result.getFine()).isGreaterThan(0.0); // 应该有罚款
        assertThat(result.isOverdue()).isTrue(); // 应该是逾期

        // 验证读者总罚款已更新
        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getTotalFine()).isGreaterThan(0.0);
    }

    @Test
    void testReturnBookLost() {
        // 先借书
        borrowService.borrowBook("R2026001", "BC0001");

        // 测试丢失还书
        BorrowService.ReturnResult result = borrowService.returnBook("R2026001", "BC0001", true, 50.0);

        assertThat(result.getFine()).isEqualTo(50.0);
        assertThat(result.isLost()).isTrue(); // 应该是丢失

        // 验证馆藏本状态为丢失
        BookCopy updatedCopy = bookCopyRepository.findByBarcode("BC0001")
                .orElseThrow(() -> new RuntimeException("馆藏本未找到"));
        assertThat(updatedCopy.getStatus()).isEqualTo("LOST");

        // 验证图书总数量未变，但可用数量未恢复
        Book updatedBook = bookRepository.findById(testBook.getId())
                .orElseThrow(() -> new RuntimeException("图书未找到"));
        assertThat(updatedBook.getAvailableCopy()).isEqualTo(4); // 仍然是4，因为丢失了
    }
}

