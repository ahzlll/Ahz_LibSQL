# AhzLib 图书馆管理系统

AhzLib 是一个完整的**图书馆管理系统**示例项目，采用前后端分离架构，实现了从登录认证、读者/图书信息维护到借阅、归还、罚款缴费的一整套业务流程。适合作为课程设计、毕业设计或小型管理系统参考实现。

## 项目特点

- ✅ **完整的业务流程**：涵盖图书馆管理的核心功能模块
- ✅ **前后端分离**：后端 RESTful API + 前端原生 HTML/JS，架构清晰
- ✅ **完善的文档**：包含数据库设计文档、API 接口文档
- ✅ **开箱即用**：提供完整的测试数据，便于快速体验和开发

---

## 技术栈

### 后端（AhzLib-backend）

- **框架**：Spring Boot 2.6.3
- **核心模块**：Web、Data JPA、Security、Validation
- **数据库**：MySQL 8.0+
- **API 文档**：springdoc-openapi-ui（Swagger/OpenAPI 3）
- **构建工具**：Maven

### 前端（AhzLib-frontend）

- **技术**：原生 HTML + CSS + JavaScript（无框架依赖）
- **UI 风格**：绿色植物主题管理后台
- **交互特性**：响应式布局、卡片悬停效果、表格展开详情、Toast 通知、动画过渡
- **通信方式**：通过 `fetch` 调用后端 REST API（封装在 `js/api.js` 中）

---

## 项目结构

```
Ahz_LibSql/
├── AhzLib-backend/              # 后端工程（Spring Boot）
│   ├── src/main/java/com/ahz/libsqlbackend/
│   │   ├── config/              # 配置类（安全、Swagger、CORS）
│   │   ├── controller/          # REST API 控制器
│   │   ├── entity/              # JPA 实体类（映射数据库表）
│   │   ├── repository/          # JPA Repository 接口
│   │   ├── service/             # 业务逻辑层（借阅、归还、罚款）
│   │   └── LibSqlBackendApplication.java
│   └── src/main/resources/
│       ├── application.yml      # 数据库与 JPA 配置
│       └── library.sql          # 建库建表脚本 + 测试数据
│
├── AhzLib-frontend/             # 前端工程（静态页面）
│   ├── index.html               # 单页应用入口
│   ├── css/
│   │   └── style.css           # 样式文件（绿色植物风格）
│   └── js/
│       ├── api.js              # API 调用封装
│       └── app.js              # 页面逻辑与交互
│
├── SQL.md                       # 数据库设计文档
├── API.md                       # REST API 接口文档
└── README.md                    # 项目说明文档（本文件）
```

---

## 功能模块

### 后端功能（AhzLib-backend）

#### 1. 登录认证

- `POST /api/auth/login`：管理员登录，校验用户名/密码，返回用户信息

#### 2. 读者与读者类别管理

- `GET/POST/PUT/DELETE /api/readers`：读者信息增删改查
  - 维护读者证号、姓名、联系方式、读者类别
  - 自动维护已借数量与累计罚款
- `GET/POST/PUT/DELETE /api/reader-types`：读者类别配置
  - 配置最大借阅册数、最大借阅天数和每日罚款标准

#### 3. 基础信息管理

- `GET/POST/PUT/DELETE /api/publishers`：出版社信息管理
- `GET/POST/PUT/DELETE /api/authors`：作者信息管理
- `GET/POST/PUT/DELETE /api/books`：图书基本信息管理
  - 维护 ISBN、书名、出版社、作者、分类
  - 自动维护总册数和可借册数

#### 4. 馆藏信息管理

- `GET/POST/PUT/DELETE /api/book-copies`：馆藏本管理
  - 每册实体书的条码、位置、状态（`IN_LIBRARY`/`BORROWED`/`LOST`/`DAMAGED`）

#### 5. 图书借阅管理

- `POST /api/borrow`：办理借阅
  - 校验读者状态和借阅限额
  - 创建借阅记录，更新馆藏状态、图书可借册数、读者已借数量

#### 6. 图书归还管理

- `POST /api/return`：办理归还
  - 支持损坏/遗失标记
  - 自动计算超期罚款
  - 更新借阅记录、馆藏状态、图书可借册数、读者已借数量和累计罚款

#### 7. 罚款缴费管理

- `POST /api/fines/pay`：办理罚款缴费
  - 记录缴费信息
  - 自动扣减读者累计罚款（避免负数）

> 📖 各接口详细字段、示例请求/响应请参考 [API.md](API.md) 或访问 Swagger UI：`http://localhost:8080/swagger-ui.html`

---

### 前端功能（AhzLib-frontend）

#### 1. 登录页

- 绿色卡片式登录界面
- 调用后端登录 API 完成认证
- 登录成功后展示当前管理员信息

#### 2. 仪表盘

- 展示系统统计数据：读者总数、图书总册数、当前在借数量
- 提供“如何开始配置系统”的操作提示

#### 3. 侧边导航与内容区

- **导航模块**：仪表盘、读者、读者类别、出版社、作者、图书、馆藏、借阅、归还、罚款
- **内容区**：每个模块为独立卡片 + 表格/表单视图
- **交互效果**：淡入动画、卡片悬停效果、导航选中状态

#### 4. 典型交互特性

- **读者管理**：表格展示 + 新增/编辑弹出表单；点击表格行可展开查看详细信息
- **空数据提示**：各管理表格在无数据时显示友好提示文案
- **操作反馈**：借阅、归还、罚款提交后，右下角 Toast 通知显示成功或错误信息
- **系统信息**：顶部显示当前系统时间及给管理员的小贴士

> 💡 前端 API 调用封装全部集中在 `js/api.js` 中，修改或扩展接口非常方便

---

## 数据库设计

### 数据表结构

包含 9 张核心业务表

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

> 📖 详细的表结构说明、字段含义、外键关系和业务约束请参考 [SQL.md](SQL.md)

---

## 快速开始

### 1. 环境要求

- **JDK**：1.8 或更高版本
- **MySQL**：8.0 或更高版本
- **Maven**：3.6 或更高版本（可选，IDE 自带亦可）
- **浏览器**：Chrome、Firefox、Edge 等现代浏览器

### 2. 准备数据库

1. 启动本地 MySQL 服务
2. 执行建库脚本：

   ```bash
   mysql -u root -p < AhzLib-backend/src/main/resources/library.sql
   ```

   或在 MySQL 客户端中：

   ```sql
   SOURCE path/to/AhzLib-backend/src/main/resources/library.sql;
   ```

### 3. 配置后端

1. 修改 `AhzLib-backend/src/main/resources/application.yml` 中的数据库连接信息：

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/library?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
       username: root # 修改为你的 MySQL 用户名
       password: 123456 # 修改为你的 MySQL 密码
   ```

2. 启动后端服务：

   ```bash
   cd AhzLib-backend
   mvn spring-boot:run
   ```

   或在 IDE 中直接运行 `LibSqlBackendApplication` 主类

3. 验证后端启动成功：
   - 访问 `http://localhost:8080/swagger-ui.html` 查看 Swagger API 文档

### 4. 启动前端

1. 使用 VS Code Live Server 或其他静态服务器打开 `AhzLib-frontend/index.html`
   - VS Code：安装 "Live Server" 扩展，右键 `index.html` 选择 "Open with Live Server"
   - 或使用 Python 简单服务器：`python -m http.server 5500`
2. 访问前端页面（例如：`http://127.0.0.1:5500`）
3. 使用测试账号登录：
   - **用户名**：`admin`
   - **密码**：`123456`

### 5. 开始使用

登录成功后，你可以：

- 在**仪表盘**查看系统统计数据
- 在**读者管理**中查看和管理读者信息
- 在**图书管理**中维护图书和馆藏信息
- 在**借阅/归还**模块办理借还业务
- 在**罚款管理**中处理罚款缴费

---

## 相关文档

- 📖 [数据库设计文档](SQL.md)：详细的表结构说明、字段含义、外键关系和业务约束
- 📖 [API 接口文档](API.md)：完整的 REST API 接口说明，包含请求/响应示例
- 📖 [Swagger UI](http://localhost:8080/swagger-ui.html)：交互式 API 文档（需启动后端服务）

---

## 开发说明

### 后端开发

- **实体类**：位于 `entity/` 包，使用 JPA 注解映射数据库表
- **数据访问**：使用 Spring Data JPA Repository，位于 `repository/` 包
- **业务逻辑**：位于 `service/` 包，复杂业务（如借阅、归还）使用 `@Transactional` 保证事务一致性
- **API 接口**：位于 `controller/` 包，使用 `@RestController` 提供 RESTful API

### 前端开发

- **API 调用**：所有后端 API 调用封装在 `js/api.js` 中，使用 `fetch` 实现
- **页面逻辑**：主逻辑在 `js/app.js` 中，包括视图切换、数据加载、表单提交等
- **样式定制**：修改 `css/style.css` 可调整 UI 风格和交互效果

### 扩展建议

- **一书多作者**：增加 `book_author` 中间表
- **图书分类**：增加 `category` 表，建立分类层级
- **预约功能**：增加 `reservation` 表，记录读者预约信息
- **统计报表**：基于现有表结构，生成借阅统计、罚款统计等报表
- **前后端分离**：使用 Vue/React 重构前端，提升开发体验

---

## 许可证

本项目仅供学习和参考使用。

---

## 贡献

欢迎提交 Issue 和 Pull Request！

##
