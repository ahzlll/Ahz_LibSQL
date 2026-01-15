package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.entity.ReaderType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@SuppressWarnings("null")
class ReaderRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReaderRepository readerRepository;

    private ReaderType testReaderType;
    private Reader testReader;

    @BeforeEach
    void setUp() {
        // 创建测试读者类别
        testReaderType = new ReaderType();
        testReaderType.setName("测试类别");
        testReaderType.setMaxBorrowCount(5);
        testReaderType.setMaxBorrowDays(30);
        testReaderType.setFineRatePerDay(0.50);
        testReaderType = entityManager.persistAndFlush(testReaderType);

        // 创建测试读者
        testReader = new Reader();
        testReader.setReaderNo("TEST001");
        testReader.setName("测试读者");
        testReader.setGender("男");
        testReader.setPhone("13800000000");
        testReader.setEmail("test@example.com");
        testReader.setReaderType(testReaderType);
        testReader.setBorrowedCount(0);
        testReader.setTotalFine(0.0);
        testReader.setStatus(1);
        testReader = entityManager.persistAndFlush(testReader);
    }

    @Test
    void testFindByReaderNo() {
        // 测试通过读者编号查找读者
        Optional<Reader> found = readerRepository.findByReaderNo("TEST001");
        
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("测试读者");
        assertThat(found.get().getReaderNo()).isEqualTo("TEST001");
    }

    @Test
    void testFindByReaderNoNotFound() {
        // 测试查找不存在的读者
        Optional<Reader> found = readerRepository.findByReaderNo("NOTEXIST");
        
        assertThat(found).isNotPresent();
    }

    @Test
    void testSaveReader() {
        // 测试保存新读者
        Reader newReader = new Reader();
        newReader.setReaderNo("TEST002");
        newReader.setName("新读者");
        newReader.setReaderType(testReaderType);
        newReader.setStatus(1);
        
        Reader saved = readerRepository.save(newReader);
        
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getReaderNo()).isEqualTo("TEST002");
    }

    @Test
    void testUpdateReader() {
        // 测试更新读者信息
        testReader.setName("更新后的名字");
        testReader.setPhone("13900000000");
        
        Reader updated = readerRepository.save(testReader);
        
        assertThat(updated.getName()).isEqualTo("更新后的名字");
        assertThat(updated.getPhone()).isEqualTo("13900000000");
    }
}

