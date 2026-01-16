# AhzLib 图书馆管理系统 - 接口文档

## 一、项目说明

AhzLib 是一个基于 **Spring Boot + MySQL** 实现的图书馆管理系统，当前仓库包含：

- 后端：`AhzLib-backend`（REST API，含 Swagger 文档）
- 前端：`AhzLib-frontend`（HTML + CSS + JS）

> 本文档主要描述后端 REST 接口及与前端的对接方式，数据库表结构请参考 `SQL.md`。  
> 在线接口文档可通过 Swagger 查看：`http://localhost:8080/swagger-ui.html`

---

## 二、技术栈

- **后端框架**：Spring Boot 2.6.x
- **持久层**：Spring Data JPA
- **安全**：Spring Security（禁用默认登录页，保留自定义登录接口）
- **文档**：springdoc-openapi-ui（Swagger/OpenAPI 3）
- **数据库**：MySQL（建表脚本见 `AhzLib-backend/src/main/resources/library.sql`）
- **前端**：原生 HTML + CSS + JS（调用后端 REST API）

---

## 三、接口总览

### 3.1 模块划分

| 模块         | 前缀/路径           | 说明           |
| ------------ | ------------------- | -------------- |
| 认证登录     | `/api/auth`         | 管理员登录接口 |
| 读者信息管理 | `/api/readers`      | 读者 CRUD      |
| 读者类别管理 | `/api/reader-types` | 借阅规则配置   |
| 出版社管理   | `/api/publishers`   | 出版社 CRUD    |
| 作者管理     | `/api/authors`      | 作者 CRUD      |
| 图书基本信息 | `/api/books`        | 图书 CRUD      |
| 图书馆藏信息 | `/api/book-copies`  | 馆藏本 CRUD    |
| 图书借阅     | `/api/borrow`       | 借阅办理       |
| 图书归还     | `/api/return`       | 归还办理       |
| 罚款缴费     | `/api/fines`        | 罚款缴费业务   |

所有接口基地址默认为：`http://localhost:8080`。

---

## 四、认证模块

### 4.1 登录

**URL**

- `POST /api/auth/login`

**请求体**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应**

```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN"
}
```

**失败响应**

- 状态码：`400 Bad Request`
- 响应体：`"用户名或密码错误"`

> 当前版本仅用于演示，后续可在此基础上接入 JWT 等更严格的鉴权方式。

---

## 五、读者与读者类别管理

### 5.1 读者类别（ReaderType）

**前缀**：`/api/reader-types`

#### 5.1.1 获取全部读者类别

- `GET /api/reader-types`
- 响应：`ReaderType[]`

```json
[
  {
    "id": 1,
    "name": "学生",
    "maxBorrowCount": 5,
    "maxBorrowDays": 30,
    "fineRatePerDay": 0.5
  }
]
```

#### 5.1.2 新增读者类别

- `POST /api/reader-types`

```json
{
  "name": "教师",
  "maxBorrowCount": 10,
  "maxBorrowDays": 60,
  "fineRatePerDay": 0.2
}
```

#### 5.1.3 修改读者类别

- `PUT /api/reader-types/{id}`

请求体同新增，返回修改后的对象。

#### 5.1.4 删除读者类别

- `DELETE /api/reader-types/{id}`

> 实际使用中应在业务层先检查是否有读者正在使用该类别。

---

### 5.2 读者（Reader）

**前缀**：`/api/readers`

#### 5.2.1 获取所有读者

- `GET /api/readers`

**响应示例**

```json
[
  {
    "id": 1,
    "readerNo": "R2026001",
    "name": "张三",
    "gender": "男",
    "phone": "13800000001",
    "email": "zhangsan@example.com",
    "borrowedCount": 1,
    "totalFine": 0.0,
    "status": 1,
    "readerType": {
      "id": 1,
      "name": "学生",
      "maxBorrowCount": 5,
      "maxBorrowDays": 30,
      "fineRatePerDay": 0.5
    }
  }
]
```

#### 5.2.2 按 ID 查询读者

- `GET /api/readers/{id}`

#### 5.2.3 新增读者

- `POST /api/readers`

```json
{
  "readerNo": "R2026005",
  "name": "新读者",
  "gender": "女",
  "phone": "13800000005",
  "email": "newreader@example.com",
  "readerType": { "id": 1 }
}
```

后端自动设置：`borrowedCount = 0`，`totalFine = 0`，`status = 1`。

#### 5.2.4 修改读者

- `PUT /api/readers/{id}`  
  请求体与新增类似，支持修改证号、姓名、联系方式、读者类别等。

#### 5.2.5 删除读者

- `DELETE /api/readers/{id}`

**成功**：`200 OK`  
**失败**（仍有未归还图书）：

- 状态码：`400`
- 响应体：`"该读者仍有未归还图书，不能删除"`

---

## 六、出版社与作者管理

### 6.1 出版社（Publisher）

**前缀**：`/api/publishers`

1. **获取全部**
   - `GET /api/publishers`
2. **新增**

   - `POST /api/publishers`

   ```json
   {
     "name": "清风出版社",
     "address": "北京朝阳区图书路 1 号",
     "phone": "010-88886666",
     "contact": "张编辑",
     "remark": "以文学人文为主"
   }
   ```

3. **修改**
   - `PUT /api/publishers/{id}`
4. **删除**
   - `DELETE /api/publishers/{id}`

> 实际生产可在删除前校验是否有图书引用该出版社。

---

### 6.2 作者（Author）

**前缀**：`/api/authors`

1. `GET /api/authors` – 列表
2. `POST /api/authors` – 新增
3. `PUT /api/authors/{id}` – 修改
4. `DELETE /api/authors/{id}` – 删除

```json
{
  "name": "鲁迅",
  "country": "中国",
  "remark": "现代文学作家"
}
```

---

## 七、图书与馆藏管理

### 7.1 图书基本信息（Book）

**前缀**：`/api/books`

1. **获取全部图书**
   - `GET /api/books`
2. **新增图书**

   - `POST /api/books`

   ```json
   {
     "isbn": "9787300000011",
     "title": "呐喊",
     "publisher": { "id": 1 },
     "author": { "id": 1 },
     "publishYear": 2000,
     "category": "文学",
     "totalCopy": 4,
     "availableCopy": 4,
     "status": 1
   }
   ```

3. **修改图书**
   - `PUT /api/books/{id}`
4. **删除图书**
   - `DELETE /api/books/{id}`

> 可在业务层加入“还有在馆册/未归还册则禁止删除”的逻辑。

---

### 7.2 馆藏信息（BookCopy）

**前缀**：`/api/book-copies`

1. `GET /api/book-copies` – 列表
2. `POST /api/book-copies` – 新增馆藏本

```json
{
  "book": { "id": 1 },
  "barcode": "BC0005",
  "location": "一楼 A 区 03 排",
  "status": "IN_LIBRARY"
}
```

1. `PUT /api/book-copies/{id}` – 修改馆藏信息（位置、状态等）
2. `DELETE /api/book-copies/{id}` – 删除馆藏本
   - 仅当 `status == "IN_LIBRARY"` 时允许，违反时返回 400 + 错误信息。

---

## 八、图书借阅与归还

### 8.1 借阅图书

**URL**

- `POST /api/borrow`

**请求体**

```json
{
  "readerNo": "R2026001",
  "barcode": "BC0001"
}
```

**业务逻辑（简要）**

1. 根据 `readerNo` 查询读者及其 `readerType`：
   - 状态必须为正常 (`status = 1`)
   - `borrowedCount < maxBorrowCount`
2. 根据 `barcode` 查询馆藏本：`status` 必须为 `IN_LIBRARY`
3. 对应图书 `availableCopy > 0`
4. 计算应还日期：`borrowDate + maxBorrowDays`
5. 写入 `borrow_record`，`status = BORROWED`
6. 更新：
   - `book_copy.status = BORROWED`
   - `book.availableCopy -= 1`
   - `reader.borrowedCount += 1`

**成功响应**

- 文本：`"借阅成功，应还日期：2026-01-20"`

**失败响应**

- 状态码：`400`
- 文本错误信息，如：
  - `"读者不存在"`
  - `"已达最大借阅数量"`
  - `"馆藏条码不存在"`
  - `"该馆藏当前不可借"`
  - `"该图书暂无可借库存"`

---

### 8.2 归还图书

**URL**

- `POST /api/return`

**请求体**

```json
{
  "readerNo": "R2026001",
  "barcode": "BC0001",
  "lostOrDamaged": false,
  "extraFine": 0
}
```

**业务逻辑（简要）**

1. 根据读者+条码找到一条 `status = BORROWED` 的 `borrow_record`。
2. 设置 `returnDate = 当前时间`。
3. 若 `returnDate > dueDate`：
   - 计算超期天数 `daysOver`；
   - 罚款 `fine = daysOver * fine_rate_per_day`；
   - 标记 `is_overdue = 1`。
4. 若 `lostOrDamaged = true`：
   - 增加 `extraFine`；
   - `status = LOST`，`book_copy.status = LOST`（不再计入可借数量）。
5. 正常归还：
   - `status = RETURNED`；
   - `book_copy.status = IN_LIBRARY`；
   - `book.availableCopy += 1`。
6. 更新读者：
   - `borrowedCount -= 1`；
   - `totalFine += fine`。

**成功响应**

- `"归还成功，应罚款：2.0 元"`

**失败响应**

- 状态码：`400`，文本错误信息，如：`"未找到对应未归还记录"` 等。

---

## 九、罚款缴费

**前缀**：`/api/fines`

### 9.1 缴纳罚款

- `POST /api/fines/pay`

**请求体**

```json
{
  "readerId": 2,
  "amount": 5.0,
  "remark": "前台现金缴费"
}
```

**业务逻辑**

1. 校验读者存在。
2. 金额必须 > 0。
3. 若 `amount > reader.totalFine`，自动截断为当前应缴总额。
4. 写入 `fine_payment` 记录。
5. 更新：`reader.totalFine -= amount`。

**成功响应**

- `"缴费成功"`

**失败响应**

- 状态码：`400`，错误信息如：`"金额必须大于 0"`、`"读者不存在"` 等。

---

## 十、前端对接说明（AhzLib-frontend）

前端项目为纯静态页面，主要逻辑在：

- `AhzLib-frontend/index.html`
- `AhzLib-frontend/js/api.js`
- `AhzLib-frontend/js/app.js`

**关键调用点：**

- 登录：`Api.login(username, password)` → `POST /api/auth/login`
- 读者管理：`Api.getReaders() / createReader() / updateReader() / deleteReader()` 对应 `/api/readers`
- 读者类别：`Api.getReaderTypes()` → `/api/reader-types`
- 出版社/作者/图书/馆藏：分别调用 `/api/publishers`、`/api/authors`、`/api/books`、`/api/book-copies`
- 借阅：`Api.borrow({readerNo, barcode})` → `/api/borrow`
- 归还：`Api.returnBook({...})` → `/api/return`
- 罚款：`Api.payFine({...})` → `/api/fines/pay`

> 若新增后端接口，只需在 `api.js` 中封装对应方法，在 `app.js` 中调用即可。

---

## 十一、快速开始（调试接口）

1. 启动 MySQL，并执行 `AhzLib-backend/src/main/resources/library.sql`：
   - 创建 `library` 数据库及所有表
   - 插入测试数据（读者类别、读者、图书、馆藏、借阅记录等）
2. 启动后端：
   - 在 `AhzLib-backend` 目录下执行：`mvn spring-boot:run` 或在 IDE 中运行 `LibSqlBackendApplication`
3. 启动前端（示例方式）：
   - 用 VS Code 的 Live Server 打开 `AhzLib-frontend/index.html`，浏览器访问 `http://127.0.0.1:5500`
4. 在前端页面完成：
   - 管理员登录（示例账号：`admin / 123456`）
   - 在各模块中查看、添加和操作数据（读者/图书/馆藏/借阅/归还/罚款）。

更多接口细节和实时请求/响应示例，可打开：

- Swagger UI：`http://localhost:8080/swagger-ui.html`
