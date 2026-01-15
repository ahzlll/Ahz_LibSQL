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


INSERT INTO sys_user(username, password_hash, role)
VALUES ('admin', '{noop}123456', 'ADMIN'); -- 如果后面用 Spring Security 的 {noop} 明文

-- 测试数据：读者类别
INSERT INTO reader_type (id, name, max_borrow_count, max_borrow_days, fine_rate_per_day) VALUES
  (1, '学生', 5, 30, 0.50),
  (2, '教师', 10, 60, 0.20),
  (3, '社会读者', 3, 20, 1.00);

-- 测试数据：出版社
INSERT INTO publisher (id, name, address, phone, contact, remark) VALUES
  (1, '清风出版社', '北京朝阳区图书路 1 号', '010-88886666', '张编辑', '以文学人文为主'),
  (2, '知行出版社', '上海浦东新区知识大道 88 号', '021-66668888', '李编辑', '计算机与理工类'),
  (3, '博学出版社', '广州天河区校园路 99 号', '020-77779999', '王编辑', '教材类图书'),
  (4, '科技出版社', '深圳南山区科技园 200 号', '0755-88889999', '赵编辑', '科技类图书'),
  (5, '人文出版社', '杭州西湖区文一路 100 号', '0571-66667777', '钱编辑', '人文社科类'),
  (6, '教育出版社', '成都锦江区学府路 50 号', '028-55556666', '孙编辑', '教育类图书');

-- 测试数据：作者
INSERT INTO author (id, name, country, remark) VALUES
  (1, '鲁迅', '中国', '现代文学作家'),
  (2, '高德纳', '美国', '《计算机程序设计艺术》作者'),
  (3, '金庸', '中国', '武侠小说作家'),
  (4, 'Robert C. Martin', '美国', '软件工程专家'),
  (5, '余华', '中国', '当代著名作家'),
  (6, '莫言', '中国', '诺贝尔文学奖获得者'),
  (7, '村上春树', '日本', '当代著名小说家'),
  (8, 'J.K.罗琳', '英国', '《哈利波特》系列作者'),
  (9, '史蒂芬·霍金', '英国', '理论物理学家'),
  (10, 'Martin Fowler', '英国', '软件架构专家'),
  (11, 'Eric Evans', '美国', '领域驱动设计专家'),
  (12, '路遥', '中国', '《平凡的世界》作者');

-- 测试数据：图书基本信息
INSERT INTO book (id, isbn, title, publisher_id, publish_year, category, total_copy, available_copy, author_id, status) VALUES
  (1, '9787300000011', '呐喊', 1, 2000, '文学', 4, 4, 1, 1),
  (2, '9787111128069', '代码大全', 2, 2010, '计算机', 3, 3, 4, 1),
  (3, '9787111544937', '算法导论', 2, 2013, '计算机', 2, 2, 2, 1),
  (4, '9787020002207', '射雕英雄传', 1, 2005, '小说', 3, 3, 3, 1);

-- 测试数据：读者
INSERT INTO reader (id, reader_no, name, gender, phone, email, reader_type_id, borrowed_count, total_fine, status, created_at) VALUES
  (1, 'R2026001', '张三', '男', '13800000001', 'zhangsan@example.com', 1, 1, 0.00, 1, NOW()),
  (2, 'R2026002', '李四', '女', '13800000002', 'lisi@example.com', 1, 0, 2.00, 1, NOW()),
  (3, 'T2026001', '王老师', '女', '13900000001', 'teacherwang@example.com', 2, 0, 0.00, 1, NOW()),
  (4, 'S2026001', '社会读者甲', '男', '13700000001', 'society1@example.com', 3, 0, 0.00, 1, NOW());

-- 测试数据：馆藏本
INSERT INTO book_copy (id, book_id, barcode, location, status) VALUES
  (1, 1, 'BC0001', '一楼 A 区 01 排', 'BORROWED'),
  (2, 1, 'BC0002', '一楼 A 区 01 排', 'IN_LIBRARY'),
  (3, 1, 'BC0003', '一楼 A 区 02 排', 'IN_LIBRARY'),
  (4, 1, 'BC0004', '一楼 A 区 02 排', 'IN_LIBRARY'),
  (5, 2, 'BC1001', '二楼 C 区 01 排', 'IN_LIBRARY'),
  (6, 2, 'BC1002', '二楼 C 区 01 排', 'IN_LIBRARY'),
  (7, 2, 'BC1003', '二楼 C 区 02 排', 'IN_LIBRARY'),
  (8, 3, 'BC2001', '二楼 D 区 01 排', 'IN_LIBRARY'),
  (9, 3, 'BC2002', '二楼 D 区 01 排', 'IN_LIBRARY'),
  (10, 4, 'BC3001', '三楼 B 区 01 排', 'IN_LIBRARY'),
  (11, 4, 'BC3002', '三楼 B 区 01 排', 'IN_LIBRARY'),
  (12, 4, 'BC3003', '三楼 B 区 02 排', 'IN_LIBRARY');

-- 测试数据：借阅记录
-- 张三 已借 1 本（BC0001 - 《呐喊》），未归还
INSERT INTO borrow_record (id, reader_id, book_copy_id, borrow_date, due_date, return_date, status, fine_amount, is_overdue) VALUES
  (1, 1, 1, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, NULL, 'BORROWED', 0.00, 0),
  -- 李四 曾借过 1 本（BC1001 - 《代码大全》），已按时归还
  (2, 2, 5, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 12 DAY, 'RETURNED', 0.00, 0),
  -- 社会读者甲 曾超期借过 1 本（BC2001 - 《算法导论》），已归还并产生罚款 2 元
  (3, 4, 8, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 5 DAY, 'RETURNED', 2.00, 1);

-- 测试数据：罚款缴费记录
-- 李四 当前尚有 2 元罚款未缴
INSERT INTO fine_payment (id, reader_id, borrow_record_id, amount, pay_date, remark) VALUES
  (1, 4, 3, 1.00, NOW() - INTERVAL 3 DAY, '部分缴清超期罚款');
