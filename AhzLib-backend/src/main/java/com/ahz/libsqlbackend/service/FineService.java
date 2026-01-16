package com.ahz.libsqlbackend.service;

import com.ahz.libsqlbackend.entity.FinePayment;
import com.ahz.libsqlbackend.entity.Reader;
import com.ahz.libsqlbackend.repository.FinePaymentRepository;
import com.ahz.libsqlbackend.repository.ReaderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@SuppressWarnings("null")
public class FineService {

    private final ReaderRepository readerRepository;
    private final FinePaymentRepository finePaymentRepository;

    public FineService(ReaderRepository readerRepository,
                       FinePaymentRepository finePaymentRepository) {
        this.readerRepository = readerRepository;
        this.finePaymentRepository = finePaymentRepository;
    }

    @Transactional
    public void payFine(String readerNo, double amount, String remark) {
        Reader reader = readerRepository.findByReaderNo(readerNo)
                .orElseThrow(() -> new RuntimeException("读者不存在"));
        if (amount <= 0) {
            throw new RuntimeException("金额必须大于 0");
        }
        double currentFine = reader.getTotalFine() == null ? 0.0 : reader.getTotalFine();
        if (amount > currentFine) {
            amount = currentFine;
        }

        FinePayment payment = new FinePayment();
        payment.setReader(reader);
        payment.setAmount(amount);
        payment.setPayDate(LocalDateTime.now());
        payment.setRemark(remark);
        finePaymentRepository.save(payment);

        reader.setTotalFine(currentFine - amount);
    }
}


