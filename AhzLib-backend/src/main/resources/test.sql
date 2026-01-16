USE library;

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
  (1, '9787300000011', '呐喊', 1, 2000, '文学', 4, 3, 1, 1),
  (2, '9787111128069', '代码大全', 2, 2010, '计算机', 4, 2, 4, 1),
  (3, '9787111544937', '算法导论', 2, 2013, '计算机', 2, 2, 2, 1),
  (4, '9787020002207', '射雕英雄传', 1, 2005, '小说', 3, 3, 3, 1),
  (5, '9787020002208', '神雕侠侣', 1, 2006, '小说', 5, 3, 3, 1),
  (6, '9787020002209', '天龙八部', 1, 2007, '小说', 5, 2, 3, 1),
  (7, '9787020002210', '活着', 5, 2012, '文学', 6, 5, 5, 1),
  (8, '9787020002211', '许三观卖血记', 5, 2013, '文学', 4, 3, 5, 1),
  (9, '9787020002212', '红高粱家族', 5, 2014, '文学', 5, 5, 6, 1),
  (10, '9787020002213', '蛙', 5, 2015, '文学', 3, 2, 6, 1),
  (11, '9787020002214', '挪威的森林', 5, 2016, '小说', 4, 3, 7, 1),
  (12, '9787020002215', '1Q84', 5, 2017, '小说', 3, 3, 7, 1),
  (13, '9787020002216', '哈利波特与魔法石', 5, 2018, '小说', 6, 4, 8, 1),
  (14, '9787020002217', '哈利波特与密室', 5, 2018, '小说', 5, 4, 8, 1),
  (15, '9787020002218', '时间简史', 4, 2019, '科学', 4, 3, 9, 1),
  (16, '9787020002219', '大设计', 4, 2020, '科学', 3, 3, 9, 1),
  (17, '9787111128070', '重构：改善既有代码的设计', 2, 2011, '计算机', 5, 4, 10, 1),
  (18, '9787111128071', '企业应用架构模式', 2, 2012, '计算机', 4, 4, 10, 1),
  (19, '9787111128072', '领域驱动设计', 2, 2013, '计算机', 4, 3, 11, 1),
  (20, '9787020002220', '平凡的世界', 1, 2010, '文学', 5, 4, 12, 1),
  (21, '9787020002221', '人生', 1, 2011, '文学', 3, 3, 12, 1),
  (22, '9787111128073', '设计模式：可复用面向对象软件的基础', 2, 2014, '计算机', 4, 3, 4, 1),
  (23, '9787111128074', '代码整洁之道', 2, 2015, '计算机', 5, 4, 4, 1),
  (24, '9787020002222', '围城', 1, 2008, '文学', 4, 4, 1, 1),
  (25, '9787020002223', '边城', 1, 2009, '文学', 3, 3, 1, 1);

-- 测试数据：读者
INSERT INTO reader (id, reader_no, name, gender, phone, email, reader_type_id, borrowed_count, total_fine, status, created_at) VALUES
  (1, 'R2026001', '张三', '男', '13800000001', 'zhangsan@example.com', 1, 1, 0.00, 1, NOW()),
  (2, 'R2026002', '李四', '女', '13800000002', 'lisi@example.com', 1, 0, 0.00, 1, NOW()),
  (3, 'T2026001', '王老师', '女', '13900000001', 'teacherwang@example.com', 2, 0, 0.00, 1, NOW()),
  (4, 'S2026001', '社会读者甲', '男', '13700000001', 'society1@example.com', 3, 0, 0.00, 1, NOW()),
  (5, 'R2026003', '赵五', '男', '13800000003', 'zhaowu@example.com', 1, 2, 0.00, 1, NOW() - INTERVAL 30 DAY),
  (6, 'R2026004', '钱六', '女', '13800000004', 'qianliu@example.com', 1, 0, 0.50, 1, NOW() - INTERVAL 25 DAY),
  (7, 'R2026005', '孙七', '男', '13800000005', 'sunqi@example.com', 1, 3, 0.00, 1, NOW() - INTERVAL 20 DAY),
  (8, 'R2026006', '周八', '女', '13800000006', 'zhouba@example.com', 1, 1, 0.00, 1, NOW() - INTERVAL 15 DAY),
  (9, 'R2026007', '吴九', '男', '13800000007', 'wujiu@example.com', 1, 0, 0.00, 1, NOW() - INTERVAL 10 DAY),
  (10, 'R2026008', '郑十', '女', '13800000008', 'zhengshi@example.com', 1, 4, 0.00, 1, NOW() - INTERVAL 5 DAY),
  (11, 'T2026002', '李教授', '男', '13900000002', 'lijiaoshou@example.com', 2, 3, 0.00, 1, NOW() - INTERVAL 60 DAY),
  (12, 'T2026003', '张教授', '女', '13900000003', 'zhangjiaoshou@example.com', 2, 5, 0.00, 1, NOW() - INTERVAL 50 DAY),
  (13, 'T2026004', '刘老师', '男', '13900000004', 'liulaoshi@example.com', 2, 2, 0.00, 1, NOW() - INTERVAL 40 DAY),
  (14, 'T2026005', '陈老师', '女', '13900000005', 'chenlaoshi@example.com', 2, 0, 0.00, 1, NOW() - INTERVAL 30 DAY),
  (15, 'S2026002', '社会读者乙', '女', '13700000002', 'society2@example.com', 3, 2, 0.00, 1, NOW() - INTERVAL 20 DAY),
  (16, 'S2026003', '社会读者丙', '男', '13700000003', 'society3@example.com', 3, 1, 0.00, 1, NOW() - INTERVAL 15 DAY),
  (17, 'S2026004', '社会读者丁', '女', '13700000004', 'society4@example.com', 3, 0, 0.00, 1, NOW() - INTERVAL 10 DAY),
  (18, 'R2026009', '冯十一', '男', '13800000009', 'fengshiyi@example.com', 1, 0, 0.00, 0, NOW() - INTERVAL 90 DAY),
  (19, 'R2026010', '陈十二', '女', '13800000010', 'chenshier@example.com', 1, 1, 0.00, 1, NOW() - INTERVAL 3 DAY),
  -- 有未缴费罚款的读者
  (20, 'R2026011', '逾期读者一', '男', '13800000011', 'overdue1@example.com', 1, 2, 15.50, 1, NOW() - INTERVAL 5 DAY),
  (21, 'R2026012', '逾期读者二', '女', '13800000012', 'overdue2@example.com', 1, 1, 8.00, 1, NOW() - INTERVAL 8 DAY),
  (22, 'T2026006', '逾期教师一', '男', '13900000006', 'overdueteacher1@example.com', 2, 3, 12.40, 1, NOW() - INTERVAL 10 DAY),
  (23, 'S2026005', '逾期社会读者', '女', '13700000005', 'overduesociety1@example.com', 3, 1, 25.00, 1, NOW() - INTERVAL 7 DAY);

-- 测试数据：馆藏本
INSERT INTO book_copy (id, book_id, barcode, location, status) VALUES
  -- 《呐喊》的馆藏本
  (1, 1, 'BC0001', '一楼 A 区 01 排', 'BORROWED'),
  (2, 1, 'BC0002', '一楼 A 区 01 排', 'IN_LIBRARY'),
  (3, 1, 'BC0003', '一楼 A 区 02 排', 'IN_LIBRARY'),
  (4, 1, 'BC0004', '一楼 A 区 02 排', 'IN_LIBRARY'),
  -- 《代码大全》的馆藏本
  (5, 2, 'BC1001', '二楼 C 区 01 排', 'IN_LIBRARY'),
  (6, 2, 'BC1002', '二楼 C 区 01 排', 'IN_LIBRARY'),
  (7, 2, 'BC1003', '二楼 C 区 02 排', 'IN_LIBRARY'),
  -- 《算法导论》的馆藏本
  (8, 3, 'BC2001', '二楼 D 区 01 排', 'IN_LIBRARY'),
  (9, 3, 'BC2002', '二楼 D 区 01 排', 'IN_LIBRARY'),
  -- 《射雕英雄传》的馆藏本
  (10, 4, 'BC3001', '三楼 B 区 01 排', 'IN_LIBRARY'),
  (11, 4, 'BC3002', '三楼 B 区 01 排', 'IN_LIBRARY'),
  (12, 4, 'BC3003', '三楼 B 区 02 排', 'IN_LIBRARY'),
  -- 《神雕侠侣》的馆藏本
  (13, 5, 'BC4001', '三楼 B 区 03 排', 'BORROWED'),
  (14, 5, 'BC4002', '三楼 B 区 03 排', 'BORROWED'),
  (15, 5, 'BC4003', '三楼 B 区 04 排', 'IN_LIBRARY'),
  (16, 5, 'BC4004', '三楼 B 区 04 排', 'IN_LIBRARY'),
  (17, 5, 'BC4005', '三楼 B 区 05 排', 'IN_LIBRARY'),
  -- 《天龙八部》的馆藏本
  (18, 6, 'BC5001', '三楼 B 区 06 排', 'BORROWED'),
  (19, 6, 'BC5002', '三楼 B 区 06 排', 'IN_LIBRARY'),
  (20, 6, 'BC5003', '三楼 B 区 07 排', 'IN_LIBRARY'),
  (21, 6, 'BC5004', '三楼 B 区 07 排', 'IN_LIBRARY'),
  -- 《活着》的馆藏本
  (22, 7, 'BC6001', '一楼 A 区 03 排', 'BORROWED'),
  (23, 7, 'BC6002', '一楼 A 区 03 排', 'IN_LIBRARY'),
  (24, 7, 'BC6003', '一楼 A 区 04 排', 'IN_LIBRARY'),
  (25, 7, 'BC6004', '一楼 A 区 04 排', 'IN_LIBRARY'),
  (26, 7, 'BC6005', '一楼 A 区 05 排', 'IN_LIBRARY'),
  (27, 7, 'BC6006', '一楼 A 区 05 排', 'IN_LIBRARY'),
  -- 《许三观卖血记》的馆藏本
  (28, 8, 'BC7001', '一楼 A 区 06 排', 'BORROWED'),
  (29, 8, 'BC7002', '一楼 A 区 06 排', 'IN_LIBRARY'),
  (30, 8, 'BC7003', '一楼 A 区 07 排', 'IN_LIBRARY'),
  (31, 8, 'BC7004', '一楼 A 区 07 排', 'IN_LIBRARY'),
  -- 《红高粱家族》的馆藏本
  (32, 9, 'BC8001', '一楼 A 区 08 排', 'IN_LIBRARY'),
  (33, 9, 'BC8002', '一楼 A 区 08 排', 'IN_LIBRARY'),
  (34, 9, 'BC8003', '一楼 A 区 09 排', 'IN_LIBRARY'),
  (35, 9, 'BC8004', '一楼 A 区 09 排', 'IN_LIBRARY'),
  (36, 9, 'BC8005', '一楼 A 区 10 排', 'IN_LIBRARY'),
  -- 《蛙》的馆藏本
  (37, 10, 'BC9001', '一楼 A 区 11 排', 'BORROWED'),
  (38, 10, 'BC9002', '一楼 A 区 11 排', 'IN_LIBRARY'),
  (39, 10, 'BC9003', '一楼 A 区 12 排', 'IN_LIBRARY'),
  -- 《挪威的森林》的馆藏本
  (40, 11, 'BCA001', '三楼 B 区 08 排', 'BORROWED'),
  (41, 11, 'BCA002', '三楼 B 区 08 排', 'IN_LIBRARY'),
  (42, 11, 'BCA003', '三楼 B 区 09 排', 'IN_LIBRARY'),
  (43, 11, 'BCA004', '三楼 B 区 09 排', 'IN_LIBRARY'),
  -- 《1Q84》的馆藏本
  (44, 12, 'BCB001', '三楼 B 区 10 排', 'IN_LIBRARY'),
  (45, 12, 'BCB002', '三楼 B 区 10 排', 'IN_LIBRARY'),
  (46, 12, 'BCB003', '三楼 B 区 11 排', 'IN_LIBRARY'),
  -- 《哈利波特与魔法石》的馆藏本
  (47, 13, 'BCC001', '三楼 B 区 12 排', 'BORROWED'),
  (48, 13, 'BCC002', '三楼 B 区 12 排', 'BORROWED'),
  (49, 13, 'BCC003', '三楼 B 区 13 排', 'IN_LIBRARY'),
  (50, 13, 'BCC004', '三楼 B 区 13 排', 'IN_LIBRARY'),
  (51, 13, 'BCC005', '三楼 B 区 14 排', 'IN_LIBRARY'),
  (52, 13, 'BCC006', '三楼 B 区 14 排', 'IN_LIBRARY'),
  -- 《哈利波特与密室》的馆藏本
  (53, 14, 'BCD001', '三楼 B 区 15 排', 'BORROWED'),
  (54, 14, 'BCD002', '三楼 B 区 15 排', 'IN_LIBRARY'),
  (55, 14, 'BCD003', '三楼 B 区 16 排', 'IN_LIBRARY'),
  (56, 14, 'BCD004', '三楼 B 区 16 排', 'IN_LIBRARY'),
  (57, 14, 'BCD005', '三楼 B 区 17 排', 'IN_LIBRARY'),
  -- 《时间简史》的馆藏本
  (58, 15, 'BCE001', '二楼 E 区 01 排', 'BORROWED'),
  (59, 15, 'BCE002', '二楼 E 区 01 排', 'IN_LIBRARY'),
  (60, 15, 'BCE003', '二楼 E 区 02 排', 'IN_LIBRARY'),
  (61, 15, 'BCE004', '二楼 E 区 02 排', 'IN_LIBRARY'),
  -- 《大设计》的馆藏本
  (62, 16, 'BCF001', '二楼 E 区 03 排', 'IN_LIBRARY'),
  (63, 16, 'BCF002', '二楼 E 区 03 排', 'IN_LIBRARY'),
  (64, 16, 'BCF003', '二楼 E 区 04 排', 'IN_LIBRARY'),
  -- 《重构》的馆藏本
  (65, 17, 'BCG001', '二楼 C 区 03 排', 'BORROWED'),
  (66, 17, 'BCG002', '二楼 C 区 03 排', 'IN_LIBRARY'),
  (67, 17, 'BCG003', '二楼 C 区 04 排', 'IN_LIBRARY'),
  (68, 17, 'BCG004', '二楼 C 区 04 排', 'IN_LIBRARY'),
  (69, 17, 'BCG005', '二楼 C 区 05 排', 'IN_LIBRARY'),
  -- 《企业应用架构模式》的馆藏本
  (70, 18, 'BCH001', '二楼 C 区 06 排', 'IN_LIBRARY'),
  (71, 18, 'BCH002', '二楼 C 区 06 排', 'IN_LIBRARY'),
  (72, 18, 'BCH003', '二楼 C 区 07 排', 'IN_LIBRARY'),
  (73, 18, 'BCH004', '二楼 C 区 07 排', 'IN_LIBRARY'),
  -- 《领域驱动设计》的馆藏本
  (74, 19, 'BCI001', '二楼 C 区 08 排', 'BORROWED'),
  (75, 19, 'BCI002', '二楼 C 区 08 排', 'IN_LIBRARY'),
  (76, 19, 'BCI003', '二楼 C 区 09 排', 'IN_LIBRARY'),
  (77, 19, 'BCI004', '二楼 C 区 09 排', 'IN_LIBRARY'),
  -- 《平凡的世界》的馆藏本
  (78, 20, 'BCJ001', '一楼 A 区 13 排', 'BORROWED'),
  (79, 20, 'BCJ002', '一楼 A 区 13 排', 'IN_LIBRARY'),
  (80, 20, 'BCJ003', '一楼 A 区 14 排', 'IN_LIBRARY'),
  (81, 20, 'BCJ004', '一楼 A 区 14 排', 'IN_LIBRARY'),
  (82, 20, 'BCJ005', '一楼 A 区 15 排', 'IN_LIBRARY'),
  -- 《人生》的馆藏本
  (83, 21, 'BCK001', '一楼 A 区 16 排', 'IN_LIBRARY'),
  (84, 21, 'BCK002', '一楼 A 区 16 排', 'IN_LIBRARY'),
  (85, 21, 'BCK003', '一楼 A 区 17 排', 'IN_LIBRARY'),
  -- 《设计模式》的馆藏本
  (86, 22, 'BCL001', '二楼 C 区 10 排', 'BORROWED'),
  (87, 22, 'BCL002', '二楼 C 区 10 排', 'IN_LIBRARY'),
  (88, 22, 'BCL003', '二楼 C 区 11 排', 'IN_LIBRARY'),
  (89, 22, 'BCL004', '二楼 C 区 11 排', 'IN_LIBRARY'),
  -- 《代码整洁之道》的馆藏本
  (90, 23, 'BCM001', '二楼 C 区 12 排', 'BORROWED'),
  (91, 23, 'BCM002', '二楼 C 区 12 排', 'IN_LIBRARY'),
  (92, 23, 'BCM003', '二楼 C 区 13 排', 'IN_LIBRARY'),
  (93, 23, 'BCM004', '二楼 C 区 13 排', 'IN_LIBRARY'),
  (94, 23, 'BCM005', '二楼 C 区 14 排', 'IN_LIBRARY'),
  -- 《围城》的馆藏本
  (95, 24, 'BCN001', '一楼 A 区 18 排', 'IN_LIBRARY'),
  (96, 24, 'BCN002', '一楼 A 区 18 排', 'IN_LIBRARY'),
  (97, 24, 'BCN003', '一楼 A 区 19 排', 'IN_LIBRARY'),
  (98, 24, 'BCN004', '一楼 A 区 19 排', 'IN_LIBRARY'),
  -- 《边城》的馆藏本
  (99, 25, 'BCO001', '一楼 A 区 20 排', 'IN_LIBRARY'),
  (100, 25, 'BCO002', '一楼 A 区 20 排', 'IN_LIBRARY'),
  (101, 25, 'BCO003', '一楼 A 区 21 排', 'IN_LIBRARY'),
  -- 遗失和损坏的馆藏本
  (102, 2, 'BC1004', '二楼 C 区 02 排', 'LOST'),
  (103, 6, 'BC5005', '三楼 B 区 08 排', 'DAMAGED'),
  -- 为逾期借阅添加的馆藏本
  (104, 1, 'BC0005', '一楼 A 区 01 排', 'BORROWED'),
  (105, 2, 'BC1005', '二楼 C 区 01 排', 'BORROWED'),
  (106, 5, 'BC4006', '三楼 B 区 03 排', 'BORROWED'),
  (107, 7, 'BC6007', '一楼 A 区 03 排', 'BORROWED'),
  (108, 11, 'BCA005', '三楼 B 区 08 排', 'BORROWED'),
  (109, 13, 'BCC007', '三楼 B 区 12 排', 'BORROWED'),
  (110, 17, 'BCG006', '二楼 C 区 03 排', 'BORROWED'),
  (111, 20, 'BCJ006', '一楼 A 区 13 排', 'BORROWED'),
  (112, 21, 'BCK004', '一楼 A 区 16 排', 'BORROWED'),
  (113, 16, 'BCF004', '二楼 E 区 03 排', 'BORROWED'),
  (114, 21, 'BCK005', '一楼 A 区 16 排', 'BORROWED');

-- 测试数据：借阅记录
-- 正在借阅的记录（27条）
INSERT INTO borrow_record (id, reader_id, book_copy_id, borrow_date, due_date, return_date, status, fine_amount, is_overdue) VALUES
  (1, 1, 1, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, NULL, 'BORROWED', 0.00, 0),
  (4, 5, 13, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, NULL, 'BORROWED', 0.00, 0),
  (5, 5, 18, NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 22 DAY, NULL, 'BORROWED', 0.00, 0),
  (6, 7, 22, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 27 DAY, NULL, 'BORROWED', 0.00, 0),
  (7, 7, 28, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 23 DAY, NULL, 'BORROWED', 0.00, 0),
  (8, 7, 37, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY, NULL, 'BORROWED', 0.00, 0),
  (9, 8, 40, NOW() - INTERVAL 12 DAY, NOW() + INTERVAL 18 DAY, NULL, 'BORROWED', 0.00, 0),
  (10, 10, 47, NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 15 DAY, NULL, 'BORROWED', 0.00, 0),
  (11, 10, 48, NOW() - INTERVAL 14 DAY, NOW() + INTERVAL 16 DAY, NULL, 'BORROWED', 0.00, 0),
  (12, 10, 53, NOW() - INTERVAL 11 DAY, NOW() + INTERVAL 19 DAY, NULL, 'BORROWED', 0.00, 0),
  (13, 10, 58, NOW() - INTERVAL 9 DAY, NOW() + INTERVAL 21 DAY, NULL, 'BORROWED', 0.00, 0),
  (14, 11, 65, NOW() - INTERVAL 20 DAY, NOW() + INTERVAL 40 DAY, NULL, 'BORROWED', 0.00, 0),
  (15, 11, 74, NOW() - INTERVAL 18 DAY, NOW() + INTERVAL 42 DAY, NULL, 'BORROWED', 0.00, 0),
  (16, 11, 86, NOW() - INTERVAL 25 DAY, NOW() + INTERVAL 35 DAY, NULL, 'BORROWED', 0.00, 0),
  (17, 12, 78, NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 30 DAY, NULL, 'BORROWED', 0.00, 0),
  (18, 12, 90, NOW() - INTERVAL 28 DAY, NOW() + INTERVAL 32 DAY, NULL, 'BORROWED', 0.00, 0),
  (19, 12, 14, NOW() - INTERVAL 22 DAY, NOW() + INTERVAL 38 DAY, NULL, 'BORROWED', 0.00, 0),
  (20, 12, 19, NOW() - INTERVAL 35 DAY, NOW() + INTERVAL 25 DAY, NULL, 'BORROWED', 0.00, 0),
  (21, 12, 49, NOW() - INTERVAL 40 DAY, NOW() + INTERVAL 20 DAY, NULL, 'BORROWED', 0.00, 0),
  (22, 13, 15, NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 45 DAY, NULL, 'BORROWED', 0.00, 0),
  (23, 13, 20, NOW() - INTERVAL 12 DAY, NOW() + INTERVAL 48 DAY, NULL, 'BORROWED', 0.00, 0),
  (24, 15, 32, NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 12 DAY, NULL, 'BORROWED', 0.00, 0),
  (25, 15, 44, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 15 DAY, NULL, 'BORROWED', 0.00, 0),
  (26, 16, 59, NOW() - INTERVAL 18 DAY, NOW() + INTERVAL 2 DAY, NULL, 'BORROWED', 0.00, 1),
  (27, 16, 70, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 10 DAY, NULL, 'BORROWED', 0.00, 0),
  -- 逾期借阅记录（应还日期在2026-01-16之前）
  (43, 1, 2, '2025-12-10 10:00:00', '2026-01-09 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (44, 2, 5, '2025-12-15 14:00:00', '2026-01-14 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (45, 5, 14, '2025-11-20 09:00:00', '2025-12-20 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (46, 7, 23, '2025-12-01 11:00:00', '2025-12-31 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (47, 8, 41, '2025-12-05 15:00:00', '2026-01-04 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (48, 10, 49, '2025-11-25 10:00:00', '2025-12-25 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (49, 11, 66, '2025-10-15 08:00:00', '2025-12-14 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (50, 12, 79, '2025-11-10 13:00:00', '2026-01-09 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (51, 13, 75, '2025-12-20 16:00:00', '2026-01-19 23:59:59', NULL, 'BORROWED', 0.00, 0),
  (52, 15, 33, '2025-12-12 09:00:00', '2026-01-01 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (53, 16, 62, '2025-11-30 14:00:00', '2025-12-20 23:59:59', NULL, 'BORROWED', 0.00, 1),
  (54, 19, 83, '2025-12-25 10:00:00', '2026-01-14 23:59:59', NULL, 'BORROWED', 0.00, 1);

-- 已按时归还的记录（10条）
INSERT INTO borrow_record (id, reader_id, book_copy_id, borrow_date, due_date, return_date, status, fine_amount, is_overdue) VALUES
  (2, 2, 5, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 12 DAY, 'RETURNED', 0.00, 0),
  (28, 5, 23, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 22 DAY, 'RETURNED', 0.00, 0),
  (29, 6, 29, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 17 DAY, 'RETURNED', 0.00, 0),
  (30, 7, 41, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 32 DAY, 'RETURNED', 0.00, 0),
  (31, 9, 45, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY, 'RETURNED', 0.00, 0),
  (32, 11, 60, NOW() - INTERVAL 70 DAY, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 12 DAY, 'RETURNED', 0.00, 0),
  (33, 11, 71, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY, 'RETURNED', 0.00, 0),
  (34, 12, 79, NOW() - INTERVAL 80 DAY, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 22 DAY, 'RETURNED', 0.00, 0),
  (35, 13, 66, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY, 'RETURNED', 0.00, 0),
  (36, 15, 33, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY, 'RETURNED', 0.00, 0);

-- 超期归还的记录（5条）
INSERT INTO borrow_record (id, reader_id, book_copy_id, borrow_date, due_date, return_date, status, fine_amount, is_overdue) VALUES
  (3, 4, 8, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 5 DAY, 'RETURNED', 2.00, 1),
  (37, 6, 30, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 3 DAY, 'RETURNED', 6.00, 1),
  (38, 8, 42, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 2 DAY, 'RETURNED', 3.00, 1),
  (39, 13, 67, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 5 DAY, 'RETURNED', 1.20, 1),
  (40, 16, 75, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY, 'RETURNED', 4.00, 1);

-- 遗失的记录（2条）
INSERT INTO borrow_record (id, reader_id, book_copy_id, borrow_date, due_date, return_date, status, fine_amount, is_overdue) VALUES
  (41, 6, 102, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 20 DAY, 'LOST', 0.00, 1),
  (42, 8, 103, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 10 DAY, 'LOST', 0.00, 1);

-- 测试数据：罚款缴费记录
INSERT INTO fine_payment (id, reader_id, borrow_record_id, amount, pay_date, remark) VALUES
  (1, 4, 3, 1.00, NOW() - INTERVAL 3 DAY, '部分缴清超期罚款'),
  (2, 4, 3, 1.00, NOW() - INTERVAL 1 DAY, '缴清剩余罚款'),
  (3, 6, 37, 3.00, NOW() - INTERVAL 2 DAY, '缴清超期罚款'),
  (4, 6, 37, 3.00, NOW() - INTERVAL 1 DAY, '重复缴费（测试）'),
  (5, 8, 38, 1.50, NOW() - INTERVAL 1 DAY, '部分缴清超期罚款'),
  (6, 8, 38, 1.50, NOW(), '缴清剩余罚款'),
  (7, 13, 39, 1.20, NOW() - INTERVAL 5 DAY, '缴清超期罚款'),
  (8, 16, 40, 2.00, NOW() - INTERVAL 1 DAY, '部分缴清超期罚款'),
  (9, 16, 40, 2.00, NOW(), '缴清剩余罚款'),
  (10, 2, NULL, 2.00, NOW() - INTERVAL 10 DAY, '一次性缴清所有罚款'),
  (11, 6, NULL, 0.50, NOW() - INTERVAL 5 DAY, '补缴剩余罚款');

-- 更新逾期借阅记录的馆藏状态
UPDATE book_copy SET status = 'BORROWED' WHERE id IN (2, 5, 14, 23, 41, 49, 66, 79, 75, 33, 62, 83, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114);

-- 更新读者的借阅数量以匹配逾期记录
UPDATE reader SET borrowed_count = 
  CASE id
    WHEN 1 THEN 2
    WHEN 2 THEN 1
    WHEN 5 THEN 3
    WHEN 7 THEN 4
    WHEN 8 THEN 2
    WHEN 10 THEN 5
    WHEN 11 THEN 4
    WHEN 12 THEN 6
    WHEN 13 THEN 3
    WHEN 15 THEN 3
    WHEN 16 THEN 3
    WHEN 19 THEN 1
    WHEN 20 THEN 2
    WHEN 21 THEN 1
    WHEN 22 THEN 3
    WHEN 23 THEN 1
    ELSE borrowed_count
  END
WHERE id IN (1, 2, 5, 7, 8, 10, 11, 12, 13, 15, 16, 19, 20, 21, 22, 23);

