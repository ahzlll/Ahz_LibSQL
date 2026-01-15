CREATE DATABASE IF NOT EXISTS library CHARACTER SET utf8mb4;
USE library;

-- 用户表（登录用）
CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 读者类别
CREATE TABLE reader_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  max_borrow_count INT NOT NULL,
  max_borrow_days INT NOT NULL,
  fine_rate_per_day DECIMAL(10,2) NOT NULL
);

-- 读者
CREATE TABLE reader (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reader_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  reader_type_id BIGINT,
  borrowed_count INT DEFAULT 0,
  total_fine DECIMAL(10,2) DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reader_type FOREIGN KEY (reader_type_id) REFERENCES reader_type(id)
);

-- 出版社
CREATE TABLE publisher (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  contact VARCHAR(50),
  remark VARCHAR(255)
);

-- 作者
CREATE TABLE author (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  remark VARCHAR(255)
);

-- 图书基本信息
CREATE TABLE book (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  publisher_id BIGINT,
  publish_year INT,
  category VARCHAR(100),
  total_copy INT DEFAULT 0,
  available_copy INT DEFAULT 0,
  author_id BIGINT,
  status TINYINT DEFAULT 1,
  CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id) REFERENCES publisher(id),
  CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES author(id)
);

-- 馆藏本（每册书）
CREATE TABLE book_copy (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) NOT NULL, -- IN_LIBRARY/BORROWED/LOST/DAMAGED
  CONSTRAINT fk_copy_book FOREIGN KEY (book_id) REFERENCES book(id)
);

-- 借阅记录
CREATE TABLE borrow_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reader_id BIGINT NOT NULL,
  book_copy_id BIGINT NOT NULL,
  borrow_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  return_date DATETIME,
  status VARCHAR(20) NOT NULL, -- BORROWED/RETURNED/LOST
  fine_amount DECIMAL(10,2) DEFAULT 0,
  is_overdue TINYINT DEFAULT 0,
  CONSTRAINT fk_borrow_reader FOREIGN KEY (reader_id) REFERENCES reader(id),
  CONSTRAINT fk_borrow_copy FOREIGN KEY (book_copy_id) REFERENCES book_copy(id)
);

-- 罚款缴费记录
CREATE TABLE fine_payment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reader_id BIGINT NOT NULL,
  borrow_record_id BIGINT,
  amount DECIMAL(10,2) NOT NULL,
  pay_date DATETIME NOT NULL,
  remark VARCHAR(255),
  CONSTRAINT fk_fine_reader FOREIGN KEY (reader_id) REFERENCES reader(id),
  CONSTRAINT fk_fine_borrow FOREIGN KEY (borrow_record_id) REFERENCES borrow_record(id)
);

-- 初始用户数据
INSERT INTO sys_user(username, password_hash, role)
VALUES ('admin', '{noop}123456', 'ADMIN'); -- 如果后面用 Spring Security 的 {noop} 明文
