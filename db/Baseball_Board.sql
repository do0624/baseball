use cat;

-- 사용자 테이블
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 게시판 주제 (MLB, NPB, KBO, 사회인야구)
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE  -- 예: 'MLB', 'NPB', 'KBO', '사회인 야구'
);

-- 게시글 테이블
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,    -- MLB, KBO 등
    user_id INT,                 -- 작성자 (익명도 가능하면 NULL 허용)
    title VARCHAR(200) NOT NULL, -- 제목
    content TEXT NOT NULL,       -- 내용
    view_count INT DEFAULT 0,    -- 조회수
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 글 생성 시간
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 글 수정 시간.
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 댓글 테이블
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT,  -- 로그인 사용자가 작성 시 필요. 익명이라면 NULL
    content TEXT NOT NULL, -- 내용
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성 시간

    FOREIGN KEY (post_id) REFERENCES posts(post_id), -- posts 테이블의 category_id 컬럼은 categories 테이블의 category_id 값을 참조
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- posts 테이블의 user_id 컬럼은 users 테이블의 user_id 값을 참조
);

