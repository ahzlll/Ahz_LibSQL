package com.ahz.libsqlbackend.repository;

import com.ahz.libsqlbackend.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
}


