-- ============================================
-- 智慧校园系统 - 测试数据初始化脚本
-- 包含50个学生和10个老师的测试数据
-- ============================================

USE smart_campus;

-- ============================================
-- 插入50个学生数据
-- ============================================
INSERT INTO students (student_no, name, gender, class, major, grade, phone, email) VALUES
-- 2024级学生 (20人)
('2024001', '张伟', '男', '计算机2024-1班', '计算机科学与技术', 2024, '13900001001', 'zhangwei@student.edu'),
('2024002', '李娜', '女', '计算机2024-1班', '计算机科学与技术', 2024, '13900001002', 'lina@student.edu'),
('2024003', '王浩', '男', '计算机2024-2班', '计算机科学与技术', 2024, '13900001003', 'wanghao@student.edu'),
('2024004', '刘芳', '女', '计算机2024-2班', '计算机科学与技术', 2024, '13900001004', 'liufang@student.edu'),
('2024005', '陈明', '男', '软件2024-1班', '软件工程', 2024, '13900001005', 'chenming@student.edu'),
('2024006', '杨丽', '女', '软件2024-1班', '软件工程', 2024, '13900001006', 'yangli@student.edu'),
('2024007', '赵强', '男', '软件2024-2班', '软件工程', 2024, '13900001007', 'zhaoqiang@student.edu'),
('2024008', '黄敏', '女', '软件2024-2班', '软件工程', 2024, '13900001008', 'huangmin@student.edu'),
('2024009', '周杰', '男', '网络2024-1班', '网络工程', 2024, '13900001009', 'zhoujie@student.edu'),
('2024010', '吴婷', '女', '网络2024-1班', '网络工程', 2024, '13900001010', 'wuting@student.edu'),
('2024011', '徐磊', '男', '计科2024-1班', '计算机科学与技术', 2024, '13900001011', 'xulei@student.edu'),
('2024012', '孙悦', '女', '计科2024-1班', '计算机科学与技术', 2024, '13900001012', 'sunyue@student.edu'),
('2024013', '马超', '男', '大数据2024-1班', '数据科学与大数据技术', 2024, '13900001013', 'machao@student.edu'),
('2024014', '胡静', '女', '大数据2024-1班', '数据科学与大数据技术', 2024, '13900001014', 'hujing@student.edu'),
('2024015', '朱刚', '男', '人工智能2024-1班', '人工智能', 2024, '13900001015', 'zhugang@student.edu'),
('2024016', '林梅', '女', '人工智能2024-1班', '人工智能', 2024, '13900001016', 'linmei@student.edu'),
('2024017', '高峰', '男', '信息安全2024-1班', '信息安全', 2024, '13900001017', 'gaofeng@student.edu'),
('2024018', '夏雪', '女', '信息安全2024-1班', '信息安全', 2024, '13900001018', 'xiaxue@student.edu'),
('2024019', '邓军', '男', '物联网2024-1班', '物联网工程', 2024, '13900001019', 'dengjun@student.edu'),
('2024020', '罗娟', '女', '物联网2024-1班', '物联网工程', 2024, '13900001020', 'luojuan@student.edu'),

-- 2023级学生 (20人)
('2023001', '刘洋', '男', '计算机2023-1班', '计算机科学与技术', 2023, '13900002001', 'liuyang@student.edu'),
('2023002', '陈秀英', '女', '计算机2023-1班', '计算机科学与技术', 2023, '13900002002', 'chenxiuying@student.edu'),
('2023003', '杨帆', '男', '软件2023-1班', '软件工程', 2023, '13900002003', 'yangfan@student.edu'),
('2023004', '黄莉', '女', '软件2023-1班', '软件工程', 2023, '13900002004', 'huangli@student.edu'),
('2023005', '周志远', '男', '网络2023-1班', '网络工程', 2023, '13900002005', 'zhouzhiyuan@student.edu'),
('2023006', '吴小燕', '女', '网络2023-1班', '网络工程', 2023, '13900002006', 'wuxiaoyan@student.edu'),
('2023007', '徐建国', '男', '计科2023-1班', '计算机科学与技术', 2023, '13900002007', 'xujianguo@student.edu'),
('2023008', '孙晓丽', '女', '计科2023-1班', '计算机科学与技术', 2023, '13900002008', 'sunxiaoli@student.edu'),
('2023009', '马晓东', '男', '大数据2023-1班', '数据科学与大数据技术', 2023, '13900002009', 'maxiaodong@student.edu'),
('2023010', '胡晓梅', '女', '大数据2023-1班', '数据科学与大数据技术', 2023, '13900002010', 'huxiaomei@student.edu'),
('2023011', '朱志明', '男', '人工智能2023-1班', '人工智能', 2023, '13900002011', 'zhuzhiming@student.edu'),
('2023012', '林晓红', '女', '人工智能2023-1班', '人工智能', 2023, '13900002012', 'linxiaohong@student.edu'),
('2023013', '高峰', '男', '信息安全2023-1班', '信息安全', 2023, '13900002013', 'gaofeng2023@student.edu'),
('2023014', '夏雨', '女', '信息安全2023-1班', '信息安全', 2023, '13900002014', 'xiayu@student.edu'),
('2023015', '邓小刚', '男', '物联网2023-1班', '物联网工程', 2023, '13900002015', 'dengxiaogang@student.edu'),
('2023016', '韩志远', '男', '计算机2023-2班', '计算机科学与技术', 2023, '13900002016', 'hanzhiyuan@student.edu'),
('2023017', '冯晓红', '女', '计算机2023-2班', '计算机科学与技术', 2023, '13900002017', 'fengxiaohong@student.edu'),
('2023018', '何志强', '男', '软件2023-2班', '软件工程', 2023, '13900002018', 'hezhiqiang@student.edu'),
('2023019', '姜美玲', '女', '网络2023-2班', '网络工程', 2023, '13900002019', 'jiangmeiling@student.edu'),
('2023020', '蒋志鹏', '男', '计科2023-2班', '计算机科学与技术', 2023, '13900002020', 'jiangzhipeng@student.edu'),

-- 2022级学生 (10人)
('2022001', '罗晓华', '女', '计算机2022-1班', '计算机科学与技术', 2022, '13900003001', 'luoxiaohua@student.edu'),
('2022002', '刘志强', '男', '计算机2022-1班', '计算机科学与技术', 2022, '13900003002', 'liuzhiqiang@student.edu'),
('2022003', '陈美玲', '女', '软件2022-1班', '软件工程', 2022, '13900003003', 'chenmeiling@student.edu'),
('2022004', '杨志刚', '男', '软件2022-1班', '软件工程', 2022, '13900003004', 'yangzhigang@student.edu'),
('2022005', '赵晓燕', '女', '网络2022-1班', '网络工程', 2022, '13900003005', 'zhaoxiaoyan@student.edu'),
('2022006', '黄志鹏', '男', '网络2022-1班', '网络工程', 2022, '13900003006', 'huangzhipeng@student.edu'),
('2022007', '周美红', '女', '计科2022-1班', '计算机科学与技术', 2022, '13900003007', 'zhoumeihong@student.edu'),
('2022008', '吴志强', '男', '计科2022-1班', '计算机科学与技术', 2022, '13900003008', 'wuzhiqiang@student.edu'),
('2022009', '徐晓梅', '女', '大数据2022-1班', '数据科学与大数据技术', 2022, '13900003009', 'xuxiaomei@student.edu'),
('2022010', '孙志远', '男', '大数据2022-1班', '数据科学与大数据技术', 2022, '13900003010', 'sunzhiyuan@student.edu'),

-- 2021级学生 (5人)
('2021001', '马晓丽', '女', '计算机2021-1班', '计算机科学与技术', 2021, '13900004001', 'maxiaoli@student.edu'),
('2021002', '胡志明', '男', '计算机2021-1班', '计算机科学与技术', 2021, '13900004002', 'huzhiming@student.edu'),
('2021003', '朱美红', '女', '软件2021-1班', '软件工程', 2021, '13900004003', 'zhumeihong@student.edu'),
('2021004', '林志强', '男', '软件2021-1班', '软件工程', 2021, '13900004004', 'linzhiqiang@student.edu'),
('2021005', '高晓燕', '女', '网络2021-1班', '网络工程', 2021, '13900004005', 'gaoxiaoyan@student.edu');

-- ============================================
-- 插入10个老师数据
-- ============================================
INSERT INTO teachers (teacher_no, name, gender, department, title, phone, email, education) VALUES
('T001', '刘建国', '男', '计算机学院', '教授', '13800001001', 'liujianguo@campus.edu', '博士'),
('T002', '陈雅琴', '女', '计算机学院', '副教授', '13800001002', 'chenyaqin@campus.edu', '博士'),
('T003', '王志刚', '男', '软件学院', '教授', '13800001003', 'wangzhigang@campus.edu', '博士'),
('T004', '张文静', '女', '软件学院', '讲师', '13800001004', 'zhangwenjing@campus.edu', '硕士'),
('T005', '李明华', '男', '网络学院', '教授', '13800001005', 'liminghua@campus.edu', '博士'),
('T006', '周小丽', '女', '网络学院', '副教授', '13800001006', 'zhouxiaoli@campus.edu', '博士'),
('T007', '吴志鹏', '男', '大数据学院', '副教授', '13800001007', 'wuzhipeng@campus.edu', '博士'),
('T008', '徐晓红', '女', '人工智能学院', '教授', '13800001008', 'xuxiaohong@campus.edu', '博士'),
('T009', '孙志远', '男', '数学学院', '副教授', '13800001009', 'sunzhiyuan@campus.edu', '博士'),
('T010', '郑美玲', '女', '物理学院', '讲师', '13800001010', 'zhengmeiling@campus.edu', '硕士');

-- ============================================
-- 为学生创建对应的用户账号
-- 密码统一为: student123 (加密后)
-- ============================================
INSERT INTO users (username, password, role, name, email, phone) VALUES
-- 2024级学生用户
('student2024001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '张伟', 'zhangwei@student.edu', '13900001001'),
('student2024002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '李娜', 'lina@student.edu', '13900001002'),
('student2024003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '王浩', 'wanghao@student.edu', '13900001003'),
('student2024004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '刘芳', 'liufang@student.edu', '13900001004'),
('student2024005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '陈明', 'chenming@student.edu', '13900001005'),
('student2024006', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '杨丽', 'yangli@student.edu', '13900001006'),
('student2024007', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '赵强', 'zhaoqiang@student.edu', '13900001007'),
('student2024008', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '黄敏', 'huangmin@student.edu', '13900001008'),
('student2024009', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '周杰', 'zhoujie@student.edu', '13900001009'),
('student2024010', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '吴婷', 'wuting@student.edu', '13900001010'),
('student2024011', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '徐磊', 'xulei@student.edu', '13900001011'),
('student2024012', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '孙悦', 'sunyue@student.edu', '13900001012'),
('student2024013', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '马超', 'machao@student.edu', '13900001013'),
('student2024014', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '胡静', 'hujing@student.edu', '13900001014'),
('student2024015', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '朱刚', 'zhugang@student.edu', '13900001015'),
('student2024016', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '林梅', 'linmei@student.edu', '13900001016'),
('student2024017', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '高峰', 'gaofeng@student.edu', '13900001017'),
('student2024018', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '夏雪', 'xiaxue@student.edu', '13900001018'),
('student2024019', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '邓军', 'dengjun@student.edu', '13900001019'),
('student2024020', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '罗娟', 'luojuan@student.edu', '13900001020'),
-- 2023级学生用户
('student2023001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '刘洋', 'liuyang@student.edu', '13900002001'),
('student2023002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '陈秀英', 'chenxiuying@student.edu', '13900002002'),
('student2023003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '杨帆', 'yangfan@student.edu', '13900002003'),
('student2023004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '黄莉', 'huangli@student.edu', '13900002004'),
('student2023005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '周志远', 'zhouzhiyuan@student.edu', '13900002005'),
('student2023006', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '吴小燕', 'wuxiaoyan@student.edu', '13900002006'),
('student2023007', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '徐建国', 'xujianguo@student.edu', '13900002007'),
('student2023008', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '孙晓丽', 'sunxiaoli@student.edu', '13900002008'),
('student2023009', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '马晓东', 'maxiaodong@student.edu', '13900002009'),
('student2023010', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '胡晓梅', 'huxiaomei@student.edu', '13900002010'),
('student2023011', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '朱志明', 'zhuzhiming@student.edu', '13900002011'),
('student2023012', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '林晓红', 'linxiaohong@student.edu', '13900002012'),
('student2023013', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '高峰', 'gaofeng2023@student.edu', '13900002013'),
('student2023014', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '夏雨', 'xiayu@student.edu', '13900002014'),
('student2023015', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '邓小刚', 'dengxiaogang@student.edu', '13900002015'),
('student2023016', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '韩志远', 'hanzhiyuan@student.edu', '13900002016'),
('student2023017', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '冯晓红', 'fengxiaohong@student.edu', '13900002017'),
('student2023018', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '何志强', 'hezhiqiang@student.edu', '13900002018'),
('student2023019', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '姜美玲', 'jiangmeiling@student.edu', '13900002019'),
('student2023020', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '蒋志鹏', 'jiangzhipeng@student.edu', '13900002020'),
-- 2022级学生用户
('student2022001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '罗晓华', 'luoxiaohua@student.edu', '13900003001'),
('student2022002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '刘志强', 'liuzhiqiang@student.edu', '13900003002'),
('student2022003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '陈美玲', 'chenmeiling@student.edu', '13900003003'),
('student2022004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '杨志刚', 'yangzhigang@student.edu', '13900003004'),
('student2022005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '赵晓燕', 'zhaoxiaoyan@student.edu', '13900003005'),
('student2022006', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '黄志鹏', 'huangzhipeng@student.edu', '13900003006'),
('student2022007', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '周美红', 'zhoumeihong@student.edu', '13900003007'),
('student2022008', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '吴志强', 'wuzhiqiang@student.edu', '13900003008'),
('student2022009', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '徐晓梅', 'xuxiaomei@student.edu', '13900003009'),
('student2022010', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '孙志远', 'sunzhiyuan@student.edu', '13900003010'),
-- 2021级学生用户
('student2021001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '马晓丽', 'maxiaoli@student.edu', '13900004001'),
('student2021002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '胡志明', 'huzhiming@student.edu', '13900004002'),
('student2021003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '朱美红', 'zhumeihong@student.edu', '13900004003'),
('student2021004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '林志强', 'linzhiqiang@student.edu', '13900004004'),
('student2021005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'student', '高晓燕', 'gaoxiaoyan@student.edu', '13900004005');

-- ============================================
-- 为老师创建对应的用户账号
-- 密码统一为: teacher123 (加密后)
-- ============================================
INSERT INTO users (username, password, role, name, email, phone) VALUES
('teacherT001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '刘建国', 'liujianguo@campus.edu', '13800001001'),
('teacherT002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '陈雅琴', 'chenyaqin@campus.edu', '13800001002'),
('teacherT003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '王志刚', 'wangzhigang@campus.edu', '13800001003'),
('teacherT004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '张文静', 'zhangwenjing@campus.edu', '13800001004'),
('teacherT005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '李明华', 'liminghua@campus.edu', '13800001005'),
('teacherT006', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '周小丽', 'zhouxiaoli@campus.edu', '13800001006'),
('teacherT007', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '吴志鹏', 'wuzhipeng@campus.edu', '13800001007'),
('teacherT008', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '徐晓红', 'xuxiaohong@campus.edu', '13800001008'),
('teacherT009', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '孙志远', 'sunzhiyuan@campus.edu', '13800001009'),
('teacherT010', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'teacher', '郑美玲', 'zhengmeiling@campus.edu', '13800001010');

-- ============================================
-- 输出完成信息
-- ============================================
SELECT '测试数据导入完成！' AS message;
SELECT CONCAT('学生总数: ', COUNT(*)) AS info FROM students;
SELECT CONCAT('教师总数: ', COUNT(*)) AS info FROM teachers;
SELECT CONCAT('用户总数: ', COUNT(*)) AS info FROM users WHERE role = 'student';
SELECT CONCAT('教师用户数: ', COUNT(*)) AS info FROM users WHERE role = 'teacher';
