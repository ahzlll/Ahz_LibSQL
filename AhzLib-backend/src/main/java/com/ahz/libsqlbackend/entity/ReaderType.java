package com.ahz.libsqlbackend.entity;

import javax.persistence.*;

@Entity
@Table(name = "reader_type")
public class ReaderType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "max_borrow_count", nullable = false)
    private Integer maxBorrowCount;

    @Column(name = "max_borrow_days", nullable = false)
    private Integer maxBorrowDays;

    @Column(name = "fine_rate_per_day", nullable = false)
    private Double fineRatePerDay;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMaxBorrowCount() {
        return maxBorrowCount;
    }

    public void setMaxBorrowCount(Integer maxBorrowCount) {
        this.maxBorrowCount = maxBorrowCount;
    }

    public Integer getMaxBorrowDays() {
        return maxBorrowDays;
    }

    public void setMaxBorrowDays(Integer maxBorrowDays) {
        this.maxBorrowDays = maxBorrowDays;
    }

    public Double getFineRatePerDay() {
        return fineRatePerDay;
    }

    public void setFineRatePerDay(Double fineRatePerDay) {
        this.fineRatePerDay = fineRatePerDay;
    }
}


