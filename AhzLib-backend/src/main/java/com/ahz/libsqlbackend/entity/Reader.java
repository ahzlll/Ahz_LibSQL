package com.ahz.libsqlbackend.entity;

import javax.persistence.*;

@Entity
@Table(name = "reader")
public class Reader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reader_no", nullable = false, unique = true, length = 50)
    private String readerNo;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @ManyToOne
    @JoinColumn(name = "reader_type_id")
    private ReaderType readerType;

    @Column(name = "borrowed_count")
    private Integer borrowedCount;

    @Column(name = "total_fine")
    private Double totalFine;

    @Column
    private Integer status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReaderNo() {
        return readerNo;
    }

    public void setReaderNo(String readerNo) {
        this.readerNo = readerNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ReaderType getReaderType() {
        return readerType;
    }

    public void setReaderType(ReaderType readerType) {
        this.readerType = readerType;
    }

    public Integer getBorrowedCount() {
        return borrowedCount;
    }

    public void setBorrowedCount(Integer borrowedCount) {
        this.borrowedCount = borrowedCount;
    }

    public Double getTotalFine() {
        return totalFine;
    }

    public void setTotalFine(Double totalFine) {
        this.totalFine = totalFine;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}


