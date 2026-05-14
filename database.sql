-- ============================================
-- 智慧校园系统 - 数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_campus 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smart_campus;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID，主键',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名，唯一',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    role ENUM('admin', 'student', 'teacher') DEFAULT 'student' COMMENT '角色：admin-管理员/student-学生/teacher-教师',
    name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '联系电话',
    avatar VARCHAR(255) DEFAULT '/avatar/default.png' COMMENT '头像路径',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),      -- 用户名索引
    INDEX idx_role (role)               -- 角色索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 学生表 (students)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID，主键',
    student_no VARCHAR(20) NOT NULL UNIQUE COMMENT '学号，唯一',
    name VARCHAR(50) NOT NULL COMMENT '学生姓名',
    gender ENUM('男', '女') DEFAULT '男' COMMENT '性别',
    class VARCHAR(50) COMMENT '班级',
    major VARCHAR(100) COMMENT '专业',
    grade INT COMMENT '年级',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    address VARCHAR(255) COMMENT '家庭住址',
    id_card VARCHAR(18) COMMENT '身份证号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_student_no (student_no),   -- 学号索引
    INDEX idx_class (class),             -- 班级索引
    INDEX idx_grade (grade)              -- 年级索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生表';

-- ============================================
-- 3. 教师表 (teachers)
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '教师ID，主键',
    teacher_no VARCHAR(20) NOT NULL UNIQUE COMMENT '工号，唯一',
    name VARCHAR(50) NOT NULL COMMENT '教师姓名',
    gender ENUM('男', '女') DEFAULT '男' COMMENT '性别',
    department VARCHAR(100) COMMENT '所属院系',
    title VARCHAR(50) COMMENT '职称（教授/副教授/讲师等）',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    education VARCHAR(50) COMMENT '学历',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_teacher_no (teacher_no),  -- 工号索引
    INDEX idx_department (department)     -- 院系索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师表';

-- ============================================
-- 4. 课程表 (courses)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID，主键',
    course_no VARCHAR(20) NOT NULL UNIQUE COMMENT '课程编号，唯一',
    name VARCHAR(100) NOT NULL COMMENT '课程名称',
    credit DECIMAL(4,2) DEFAULT 0 COMMENT '学分',
    hours INT DEFAULT 0 COMMENT '总学时',
    teacher_id INT COMMENT '授课教师ID',
    semester VARCHAR(20) COMMENT '开设学期（如：2024春季）',
    classroom VARCHAR(50) COMMENT '上课教室',
    max_students INT DEFAULT 50 COMMENT '最大选课人数',
    description TEXT COMMENT '课程简介',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_course_no (course_no),     -- 课程编号索引
    INDEX idx_teacher (teacher_id),      -- 教师索引
    INDEX idx_semester (semester),       -- 学期索引
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- ============================================
-- 5. 成绩表 (scores)
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '成绩记录ID，主键',
    student_id INT NOT NULL COMMENT '学生ID',
    course_id INT NOT NULL COMMENT '课程ID',
    score DECIMAL(5,2) COMMENT '成绩（0-100）',
    usual_score DECIMAL(5,2) COMMENT '平时成绩',
    midterm_score DECIMAL(5,2) COMMENT '期中成绩',
    final_score DECIMAL(5,2) COMMENT '期末成绩',
    semester VARCHAR(20) COMMENT '学期',
    exam_date DATE COMMENT '考试日期',
    remark VARCHAR(255) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_student (student_id),      -- 学生索引
    INDEX idx_course (course_id),        -- 课程索引
    INDEX idx_semester (semester),       -- 学期索引
    UNIQUE KEY uk_student_course (student_id, course_id),  -- 学生和课程唯一约束
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成绩表';

-- ============================================
-- 6. 公告表 (announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID，主键',
    title VARCHAR(200) NOT NULL COMMENT '公告标题',
    content TEXT COMMENT '公告内容（富文本）',
    author VARCHAR(50) COMMENT '发布人',
    category VARCHAR(50) DEFAULT '通知' COMMENT '分类：通知/新闻/活动',
    is_top TINYINT(1) DEFAULT 0 COMMENT '是否置顶：0-否，1-是',
    is_publish TINYINT(1) DEFAULT 1 COMMENT '是否发布：0-草稿，1-已发布',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_is_top (is_top),           -- 置顶索引
    INDEX idx_category (category),        -- 分类索引
    INDEX idx_created (created_at)       -- 时间索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- ============================================
-- 7. 选课表 (course_selections)
-- ============================================
CREATE TABLE IF NOT EXISTS course_selections (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '选课记录ID',
    student_id INT NOT NULL COMMENT '学生ID',
    course_id INT NOT NULL COMMENT '课程ID',
    semester VARCHAR(20) COMMENT '学期',
    selected_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '选课时间',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed' COMMENT '状态',
    UNIQUE KEY uk_selection (student_id, course_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选课表';

-- ============================================
-- 8. 初始化默认管理员账号
-- ============================================
INSERT INTO users (username, password, role, name, email, phone) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'admin', '系统管理员', 'admin@campus.edu', '13800138000');
-- 默认密码: admin123

-- ============================================
-- 9. 初始化测试数据
-- ============================================
INSERT INTO students (student_no, name, gender, class, major, grade, phone, email) VALUES
('2024001', '张三', '男', '计算机2024-1班', '计算机科学与技术', 2024, '13900001001', 'zhangsan@student.edu'),
('2024002', '李四', '女', '计算机2024-1班', '计算机科学与技术', 2024, '13900001002', 'lisi@student.edu'),
('2024003', '王五', '男', '软件工程2024-1班', '软件工程', 2024, '13900001003', 'wangwu@student.edu'),
('2023001', '赵六', '女', '计算机2023-1班', '计算机科学与技术', 2023, '13900001004', 'zhaoliu@student.edu'),
('2023002', '钱七', '男', '软件工程2023-1班', '软件工程', 2023, '13900001005', 'qianqi@student.edu');

INSERT INTO teachers (teacher_no, name, gender, department, title, phone, email, education) VALUES
('T001', '刘教授', '男', '计算机学院', '教授', '13800001001', 'liuprof@campus.edu', '博士'),
('T002', '陈副教授', '女', '计算机学院', '副教授', '13800001002', 'chen@campus.edu', '博士'),
('T003', '王讲师', '男', '软件学院', '讲师', '13800001003', 'wang@campus.edu', '硕士'),
('T004', '张教授', '女', '数学学院', '教授', '13800001004', 'zhang@campus.edu', '博士');

INSERT INTO courses (course_no, name, credit, hours, teacher_id, semester, classroom, max_students, description) VALUES
('CS101', '数据结构与算法', 4.0, 64, 1, '2024春季', 'A101', 60, '本课程主要讲授数据结构的基本概念和常用算法。'),
('CS102', '操作系统', 3.5, 56, 2, '2024春季', 'A102', 55, '介绍操作系统的原理、设计和实现。'),
('CS201', '计算机网络', 3.0, 48, 1, '2024春季', 'A103', 60, '讲解计算机网络体系结构和协议。'),
('SE101', '软件工程导论', 3.0, 48, 3, '2024春季', 'B201', 50, '软件工程基本概念和方法论。'),
('MATH101', '高等数学', 5.0, 80, 4, '2024春季', 'C101', 100, '大学数学基础课程。');

INSERT INTO scores (student_id, course_id, score, usual_score, midterm_score, final_score, semester) VALUES
(1, 1, 88, 85, 90, 88, '2024春季'),
(1, 2, 92, 88, 95, 93, '2024春季'),
(1, 3, 85, 82, 88, 85, '2024春季'),
(2, 1, 95, 92, 98, 95, '2024春季'),
(2, 2, 90, 88, 92, 90, '2024春季'),
(3, 1, 78, 75, 80, 78, '2024春季'),
(3, 4, 88, 85, 90, 88, '2024春季'),
(4, 1, 91, 88, 93, 92, '2024春季'),
(4, 2, 87, 84, 90, 87, '2024春季'),
(5, 4, 92, 90, 94, 92, '2024春季'),
(5, 5, 85, 82, 88, 85, '2024春季');

INSERT INTO announcements (title, content, author, category, is_top) VALUES
('2024年春季学期开学通知', '各位老师、同学：\n\n新学期将于2024年3月1日正式开学，请大家做好准备。\n\n1. 请于2月28日前完成注册\n2. 课程表可在教务系统查询\n3. 如有疑问请联系教务处', '教务处', '通知', 1),
('关于举办校园科技文化节的通知', '为丰富校园文化生活，提升学生综合素质，学校将于4月举办第十届校园科技文化节。届时将有各类科技竞赛、讲座和展览活动，欢迎广大师生积极参与。', '学生处', '活动', 0),
('图书馆开放时间调整公告', '为更好地服务师生，图书馆自3月1日起调整开放时间为：\n周一至周五：8:00-22:00\n周六周日：9:00-21:00\n\n请各位读者合理安排时间。', '图书馆', '通知', 0),
('关于开展2024年度教学质量评估的通知', '各学院、各位老师：\n\n为全面提升学校教学质量，现开展2024年度教学质量评估工作。请各位老师于5月15日前完成自评报告，学院将于5月底前完成评审。具体评估指标和操作流程详见教务系统。', '教学质量管理处', '通知', 0),
('关于举办计算机程序设计大赛的通知', '为激发学生学习编程的兴趣，培养创新精神和团队协作能力，学校决定举办第十五届计算机程序设计大赛。\n\n报名时间：4月1日至4月20日\n比赛时间：5月8日\n参赛对象：全校本科生\n奖项设置：一等奖3名，二等奖10名，三等奖20名\n\n欢迎广大同学踊跃报名参赛！', '计算机学院', '活动', 1);

-- ============================================
-- 10. 创建数据库用户（可选，用于生产环境）
-- ============================================
-- CREATE USER IF NOT EXISTS 'campus_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON smart_campus.* TO 'campus_user'@'localhost';
-- FLUSH PRIVILEGES;

SELECT '数据库初始化完成！' AS message;
