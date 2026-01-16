# AhzLib 图书馆管理系统 - 数据库设计文档

## 1. 概述

- **数据库名称**：`library`
- **字符集**：`utf8mb4`
- **SQL 脚本文件**：
  - `AhzLib-backend/src/main/resources/library.sql`：建库建表脚本 + 初始用户数据
  - `AhzLib-backend/src/main/resources/test.sql`：测试数据（可选，用于开发测试）
- **主要内容**：
  - 用户与权限管理
  - 读者与读者类别配置
  - 作者与出版社信息
  - 图书基本信息与馆藏信息
  - 借阅记录与罚款缴费记录

> 说明：
> - `library.sql`：包含数据库和表结构定义，以及初始管理员用户数据
> - `test.sql`：包含完整的测试数据，覆盖正常借阅、按时归还、超期归还、罚款缴费等典型业务场景，便于前后端联调测试
> - 本文件侧重表结构说明和字段含义

---

## 2. 表结构总览

| 表名            | 说明                     |
| --------------- | ------------------------ |
| `sys_user`      | 系统用户（登录账号）     |
| `reader_type`   | 读者类别配置             |
| `reader`        | 读者信息                 |
| `publisher`     | 出版社信息               |
| `author`        | 作者信息                 |
| `book`          | 图书基本信息             |
| `book_copy`     | 图书馆藏本（每册实体书） |
| `borrow_record` | 借阅记录                 |
| `fine_payment`  | 罚款缴费记录             |

---

## 3. 各表字段说明

### 3.1 `sys_user`（系统用户）

用于后台登录认证。

```sql
CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| 字段名          | 类型         | 约束             | 说明                             |
| --------------- | ------------ | ---------------- | -------------------------------- |
| `id`            | BIGINT       | PK, AUTO_INC     | 用户主键 ID                      |
| `username`      | VARCHAR(50)  | UNIQUE, NOT NULL | 登录用户名                       |
| `password_hash` | VARCHAR(255) | NOT NULL         | 密码（支持 `{noop}` 明文或加密） |
| `role`          | VARCHAR(20)  | NOT NULL         | 角色：`ADMIN` 等                 |
| `status`        | TINYINT      | DEFAULT 1        | 状态：1=正常，0=禁用             |
| `created_at`    | DATETIME     | DEFAULT NOW      | 创建时间                         |

**初始化数据**：

```sql
INSERT INTO sys_user(username, password_hash, role)
VALUES ('admin', '{noop}123456', 'ADMIN');
```

---

### 3.2 `reader_type`（读者类别）

配置不同读者的借阅规则。

```sql
CREATE TABLE reader_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  max_borrow_count INT NOT NULL,
  max_borrow_days INT NOT NULL,
  fine_rate_per_day DECIMAL(10,2) NOT NULL
);
```

| 字段名              | 类型          | 约束         | 说明                        |
| ------------------- | ------------- | ------------ | --------------------------- |
| `id`                | BIGINT        | PK, AUTO_INC | 读者类别 ID                 |
| `name`              | VARCHAR(50)   | NOT NULL     | 类别名称（学生/教师等）     |
| `max_borrow_count`  | INT           | NOT NULL     | 最大可同时借阅册数          |
| `max_borrow_days`   | INT           | NOT NULL     | 单次最大借阅天数            |
| `fine_rate_per_day` | DECIMAL(10,2) | NOT NULL     | 每超期 1 天的罚款金额（元） |

**测试数据示例**：

```sql
INSERT INTO reader_type (name, max_borrow_count, max_borrow_days, fine_rate_per_day) VALUES
  ('学生', 5, 30, 0.50),
  ('教师', 10, 60, 0.20),
  ('社会读者', 3, 20, 1.00);
```

---

### 3.3 `reader`（读者信息）

存储所有读者基础信息和借阅状态。

```sql
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
```

| 字段名           | 类型          | 约束                   | 说明                      |
| ---------------- | ------------- | ---------------------- | ------------------------- |
| `id`             | BIGINT        | PK, AUTO_INC           | 读者 ID                   |
| `reader_no`      | VARCHAR(50)   | UNIQUE, NOT NULL       | 读者证号/学号             |
| `name`           | VARCHAR(50)   | NOT NULL               | 姓名                      |
| `gender`         | VARCHAR(10)   |                        | 性别                      |
| `phone`          | VARCHAR(20)   |                        | 电话                      |
| `email`          | VARCHAR(100)  |                        | 邮箱                      |
| `reader_type_id` | BIGINT        | FK -> `reader_type.id` | 读者类别                  |
| `borrowed_count` | INT           | DEFAULT 0              | 当前已借未还的册数        |
| `total_fine`     | DECIMAL(10,2) | DEFAULT 0              | 累计未缴罚款金额（元）    |
| `status`         | TINYINT       | DEFAULT 1              | 状态：1=正常，0=冻结/注销 |
| `created_at`     | DATETIME      | DEFAULT NOW            | 注册时间                  |

---

### 3.4 `publisher`（出版社）

```sql
CREATE TABLE publisher (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  contact VARCHAR(50),
  remark VARCHAR(255)
);
```

| 字段名    | 类型         | 约束         | 说明       |
| --------- | ------------ | ------------ | ---------- |
| `id`      | BIGINT       | PK, AUTO_INC | 出版社 ID  |
| `name`    | VARCHAR(100) | NOT NULL     | 出版社名称 |
| `address` | VARCHAR(255) |              | 地址       |
| `phone`   | VARCHAR(20)  |              | 电话       |
| `contact` | VARCHAR(50)  |              | 联系人     |
| `remark`  | VARCHAR(255) |              | 备注       |

---

### 3.5 `author`（作者）

```sql
CREATE TABLE author (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50),
  remark VARCHAR(255)
);
```

| 字段名    | 类型         | 约束         | 说明      |
| --------- | ------------ | ------------ | --------- |
| `id`      | BIGINT       | PK, AUTO_INC | 作者 ID   |
| `name`    | VARCHAR(100) | NOT NULL     | 作者姓名  |
| `country` | VARCHAR(50)  |              | 国家/地区 |
| `remark`  | VARCHAR(255) |              | 备注      |

> 注意：当前设计为单作者，如需支持一书多作者，可增加中间表 `book_author(book_id, author_id)`。

---

### 3.6 `book`（图书基本信息）

```sql
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
```

| 字段名           | 类型         | 约束                 | 说明                          |
| ---------------- | ------------ | -------------------- | ----------------------------- |
| `id`             | BIGINT       | PK, AUTO_INC         | 图书 ID                       |
| `isbn`           | VARCHAR(20)  | UNIQUE, NOT NULL     | ISBN 编号（唯一）             |
| `title`          | VARCHAR(200) | NOT NULL             | 书名                          |
| `publisher_id`   | BIGINT       | FK -> `publisher.id` | 出版社                        |
| `publish_year`   | INT          |                      | 出版年份                      |
| `category`       | VARCHAR(100) |                      | 分类（文学、计算机、小说等）  |
| `total_copy`     | INT          | DEFAULT 0            | 馆藏总册数                    |
| `available_copy` | INT          | DEFAULT 0            | 当前可借册数                  |
| `author_id`      | BIGINT       | FK -> `author.id`    | 作者                          |
| `status`         | TINYINT      | DEFAULT 1            | 状态：1=正常，0=下架/逻辑删除 |

---

### 3.7 `book_copy`（馆藏本）

每册实体书的详细信息，包括条码、位置和状态。

```sql
CREATE TABLE book_copy (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) NOT NULL, -- IN_LIBRARY/BORROWED/LOST/DAMAGED
  CONSTRAINT fk_copy_book FOREIGN KEY (book_id) REFERENCES book(id)
);
```

| 字段名     | 类型         | 约束                      | 说明                                           |
| ---------- | ------------ | ------------------------- | ---------------------------------------------- |
| `id`       | BIGINT       | PK, AUTO_INC              | 馆藏本 ID                                      |
| `book_id`  | BIGINT       | FK -> `book.id`, NOT NULL | 所属图书                                       |
| `barcode`  | VARCHAR(50)  | UNIQUE, NOT NULL          | 馆藏条码（每册唯一）                           |
| `location` | VARCHAR(100) |                           | 存放位置（如：一楼 A 区 01 排）                |
| `status`   | VARCHAR(20)  | NOT NULL                  | 状态：`IN_LIBRARY`/`BORROWED`/`LOST`/`DAMAGED` |

---

### 3.8 `borrow_record`（借阅记录）

记录所有借阅和归还历史，不删除记录，只更新状态。

```sql
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
```

| 字段名         | 类型          | 约束                           | 说明                               |
| -------------- | ------------- | ------------------------------ | ---------------------------------- |
| `id`           | BIGINT        | PK, AUTO_INC                   | 借阅记录 ID                        |
| `reader_id`    | BIGINT        | FK -> `reader.id`, NOT NULL    | 读者                               |
| `book_copy_id` | BIGINT        | FK -> `book_copy.id`, NOT NULL | 馆藏本                             |
| `borrow_date`  | DATETIME      | NOT NULL                       | 借阅日期                           |
| `due_date`     | DATETIME      | NOT NULL                       | 应还日期                           |
| `return_date`  | DATETIME      |                                | 实际归还日期（NULL 表示未归还）    |
| `status`       | VARCHAR(20)   | NOT NULL                       | 状态：`BORROWED`/`RETURNED`/`LOST` |
| `fine_amount`  | DECIMAL(10,2) | DEFAULT 0                      | 罚款金额（元）                     |
| `is_overdue`   | TINYINT       | DEFAULT 0                      | 是否超期：1=是，0=否               |

---

### 3.9 `fine_payment`（罚款缴费记录）

记录读者的罚款缴费历史。

```sql
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
```

| 字段名             | 类型          | 约束                        | 说明                                         |
| ------------------ | ------------- | --------------------------- | -------------------------------------------- |
| `id`               | BIGINT        | PK, AUTO_INC                | 缴费记录 ID                                  |
| `reader_id`        | BIGINT        | FK -> `reader.id`, NOT NULL | 读者                                         |
| `borrow_record_id` | BIGINT        | FK -> `borrow_record.id`    | 关联的借阅记录（可为空，支持一次性缴清多笔） |
| `amount`           | DECIMAL(10,2) | NOT NULL                    | 缴费金额（元）                               |
| `pay_date`         | DATETIME      | NOT NULL                    | 缴费日期                                     |
| `remark`           | VARCHAR(255)  |                             | 备注（如：部分缴清、损坏赔偿等）             |

---

## 4. 外键关系

- `reader.reader_type_id` → `reader_type.id`
- `book.publisher_id` → `publisher.id`
- `book.author_id` → `author.id`
- `book_copy.book_id` → `book.id`
- `borrow_record.reader_id` → `reader.id`
- `borrow_record.book_copy_id` → `book_copy.id`
- `fine_payment.reader_id` → `reader.id`
- `fine_payment.borrow_record_id` → `borrow_record.id`

---

## 5. 业务约束说明

### 5.1 借阅业务约束

- 读者借阅时需检查：

  - 读者状态为正常（`reader.status = 1`）
  - 当前已借册数 < 读者类别的最大借阅册数（`reader.borrowed_count < reader_type.max_borrow_count`）
  - 馆藏本状态为在馆（`book_copy.status = 'IN_LIBRARY'`）

- 借阅成功后：
  - 创建 `borrow_record`，状态为 `BORROWED`，`return_date` 为 NULL
  - 更新 `book_copy.status = 'BORROWED'`
  - 更新 `book.available_copy -= 1`
  - 更新 `reader.borrowed_count += 1`

### 5.2 归还业务约束

- 归还时：
  - 更新 `borrow_record`：设置 `return_date`、`status = 'RETURNED'`
  - 计算超期罚款：`fine_amount = max(0, (return_date - due_date)) * reader_type.fine_rate_per_day`
  - 更新 `book_copy.status`：正常归还为 `IN_LIBRARY`，遗失/损坏为 `LOST`/`DAMAGED`
  - 更新 `book.available_copy`：正常归还 +1，遗失不增加
  - 更新 `reader.borrowed_count -= 1`
  - 更新 `reader.total_fine += fine_amount`

### 5.3 罚款缴费约束

- 缴费时：
  - 创建 `fine_payment` 记录
  - 更新 `reader.total_fine -= amount`（避免出现负数）

---

## 6. 测试数据说明

`test.sql` 中包含完整的测试数据，覆盖了正常借阅、按时归还、超期归还、罚款缴费等典型业务场景，便于前后端联调测试。

**测试数据包括**：
- 读者类别：学生、教师、社会读者
- 出版社
- 作者
- 图书
- 读者
- 馆藏本
- 借阅记录（包含正常借阅、按时归还、超期归还场景）
- 罚款缴费记录

> 💡 注意：`test.sql` 仅用于开发测试。

---

## 7. 使用说明

1. **执行建库脚本**（创建表结构）：

   ```bash
   mysql -u root -p < AhzLib-backend/src/main/resources/library.sql
   ```

   或在 MySQL 客户端中：

   ```sql
   SOURCE path/to/AhzLib-backend/src/main/resources/library.sql;
   ```

   此脚本会创建数据库 `library` 和所有表结构，并插入初始管理员用户（用户名：`admin`，密码：`123456`）。

2. **（可选）导入测试数据**：

   如果需要测试数据用于开发测试，可以执行：

   ```bash
   mysql -u root -p library < AhzLib-backend/src/main/resources/test.sql
   ```

   或在 MySQL 客户端中：

   ```sql
   USE library;
   SOURCE path/to/AhzLib-backend/src/main/resources/test.sql;
   ```

   > 💡 注意：`test.sql` 包含测试数据，仅用于开发测试。

3. **配置后端**：
   修改 `AhzLib-backend/src/main/resources/application.yml` 中的数据库连接信息。

4. **验证数据**：
   登录系统后，可在前端界面查看各模块数据，或通过 Swagger UI 测试 API。

---

## 8. 后续扩展建议

- **一书多作者**：增加 `book_author` 中间表
- **图书分类**：增加 `category` 表，建立分类层级
- **预约功能**：增加 `reservation` 表，记录读者预约信息
- **统计报表**：基于现有表结构，可生成借阅统计、罚款统计等报表
