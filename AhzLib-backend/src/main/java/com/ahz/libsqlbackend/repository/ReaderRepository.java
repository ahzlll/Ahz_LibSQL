package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReaderRepository extends JpaRepository<Reader, Long> {

    Optional<Reader> findByReaderNo(String readerNo);
}


