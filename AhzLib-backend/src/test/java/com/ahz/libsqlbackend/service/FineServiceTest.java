package com.ahz.libsqlbackend.service;

import com.ahz.libsqlbackend.entity.FinePayment;
import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.entity.ReaderType;
import com.ahz.libsqlbackend.repository.FinePaymentRepository;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(FineService.class)
@SuppressWarnings("null")
class FineServiceTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FineService fineService;

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private FinePaymentRepository finePaymentRepository;

    private ReaderType testReaderType;
    private Reader testReader;

    @BeforeEach
    void setUp() {
        // 创建读者类别
        testReaderType = new ReaderType();
        testReaderType.setName("学生");
        testReaderType.setMaxBorrowCount(5);
        testReaderType.setMaxBorrowDays(30);
        testReaderType.setFineRatePerDay(0.50);
        testReaderType = entityManager.persistAndFlush(testReaderType);

        // 创建读者
        testReader = new Reader();
        testReader.setReaderNo("R2026001");
        testReader.setName("测试读者");
        testReader.setReaderType(testReaderType);
        testReader.setBorrowedCount(0);
        testReader.setTotalFine(100.0); // 设置初始罚款
        testReader.setStatus(1);
        testReader = entityManager.persistAndFlush(testReader);
    }

    @Test
    void testPayFineSuccess() {
        // 测试成功缴费
        double initialFine = testReader.getTotalFine();
        double payAmount = 50.0;

        fineService.payFine(testReader.getReaderNo(), payAmount, "测试缴费");

        // 验证读者罚款已减少
        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getTotalFine()).isEqualTo(initialFine - payAmount);

        // 验证缴费记录已创建
        FinePayment payment = finePaymentRepository.findAll().stream()
                .filter(p -> p.getReader().getId().equals(testReader.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("缴费记录未找到"));
        assertThat(payment.getAmount()).isEqualTo(payAmount);
        assertThat(payment.getRemark()).isEqualTo("测试缴费");
    }

    @Test
    void testPayFineFullAmount() {
        // 测试全额缴费
        double payAmount = 100.0;

        fineService.payFine(testReader.getReaderNo(), payAmount, "全额缴费");

        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getTotalFine()).isEqualTo(0.0);
    }

    @Test
    void testPayFineExceedAmount() {
        // 测试缴费金额超过总罚款（应该只扣除总罚款金额）
        double payAmount = 200.0; // 超过总罚款

        fineService.payFine(testReader.getReaderNo(), payAmount, "超额缴费");

        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getTotalFine()).isEqualTo(0.0); // 应该清零，而不是负数
    }

    @Test
    void testPayFineInvalidAmount() {
        // 测试无效金额（负数或0）
        assertThatThrownBy(() -> fineService.payFine(testReader.getReaderNo(), -10.0, "无效金额"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("金额必须大于 0");

        assertThatThrownBy(() -> fineService.payFine(testReader.getReaderNo(), 0.0, "零金额"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("金额必须大于 0");
    }

    @Test
    void testPayFineReaderNotFound() {
        // 测试读者不存在的情况
        assertThatThrownBy(() -> fineService.payFine("NONEXISTENT", 50.0, "测试"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("读者不存在");
    }

    @Test
    void testPayFineMultiplePayments() {
        // 测试多次缴费
        double initialFine = testReader.getTotalFine();

        fineService.payFine(testReader.getReaderNo(), 30.0, "第一次缴费");
        Reader reader1 = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(reader1.getTotalFine()).isEqualTo(initialFine - 30.0);

        fineService.payFine(testReader.getReaderNo(), 40.0, "第二次缴费");
        Reader reader2 = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(reader2.getTotalFine()).isEqualTo(initialFine - 70.0);

        // 验证创建了两条缴费记录
        long paymentCount = finePaymentRepository.findAll().stream()
                .filter(p -> p.getReader().getId().equals(testReader.getId()))
                .count();
        assertThat(paymentCount).isEqualTo(2);
    }

    @Test
    void testPayFineWithZeroFine() {
        // 测试读者没有罚款的情况
        testReader.setTotalFine(0.0);
        entityManager.persistAndFlush(testReader);

        fineService.payFine(testReader.getReaderNo(), 10.0, "无罚款缴费");

        Reader updatedReader = readerRepository.findById(testReader.getId())
                .orElseThrow(() -> new RuntimeException("读者未找到"));
        assertThat(updatedReader.getTotalFine()).isEqualTo(0.0); // 应该保持为0
    }
}

