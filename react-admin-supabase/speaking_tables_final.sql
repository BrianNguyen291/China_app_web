-- Tạo bảng topics_speak để lưu trữ các chủ đề luyện nói
CREATE TABLE IF NOT EXISTS topics_speak (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng lessons_speak để lưu trữ các bài học trong từng chủ đề
CREATE TABLE IF NOT EXISTS lessons_speak (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES topics_speak(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng questions_speak để lưu trữ các câu hỏi trong từng bài học
CREATE TABLE IF NOT EXISTS questions_speak (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons_speak(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_lessons_speak_topic_id ON lessons_speak(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_speak_lesson_id ON questions_speak(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_speak_difficulty ON questions_speak(difficulty);
CREATE INDEX IF NOT EXISTS idx_topics_speak_created_at ON topics_speak(created_at);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo triggers để tự động cập nhật updated_at
CREATE TRIGGER update_topics_speak_updated_at 
    BEFORE UPDATE ON topics_speak 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_speak_updated_at 
    BEFORE UPDATE ON lessons_speak 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_speak_updated_at 
    BEFORE UPDATE ON questions_speak 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo RLS (Row Level Security) policies
ALTER TABLE topics_speak ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_speak ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions_speak ENABLE ROW LEVEL SECURITY;

-- Policy cho topics_speak - cho phép tất cả authenticated users đọc/ghi
CREATE POLICY "Allow all operations for authenticated users on topics_speak" 
    ON topics_speak FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Policy cho lessons_speak - cho phép tất cả authenticated users đọc/ghi
CREATE POLICY "Allow all operations for authenticated users on lessons_speak" 
    ON lessons_speak FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Policy cho questions_speak - cho phép tất cả authenticated users đọc/ghi
CREATE POLICY "Allow all operations for authenticated users on questions_speak" 
    ON questions_speak FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Thêm dữ liệu mẫu
INSERT INTO topics_speak (title, description) VALUES
('Gia đình', 'Các chủ đề về gia đình, mối quan hệ trong gia đình'),
('Công việc', 'Các chủ đề về công việc, nghề nghiệp, môi trường làm việc'),
('Du lịch', 'Các chủ đề về du lịch, địa điểm, trải nghiệm'),
('Ẩm thực', 'Các chủ đề về món ăn, nấu ăn, nhà hàng'),
('Học tập', 'Các chủ đề về học tập, giáo dục, kỹ năng')
ON CONFLICT DO NOTHING;

-- Thêm bài học mẫu cho chủ đề Gia đình
INSERT INTO lessons_speak (topic_id, title, description)
SELECT 
    (SELECT id FROM topics_speak WHERE title = 'Gia đình' LIMIT 1),
    title,
    description
FROM (VALUES
    ('Giới thiệu gia đình', 'Bài học cơ bản về cách giới thiệu các thành viên trong gia đình'),
    ('Mối quan hệ gia đình', 'Học về các mối quan hệ và cách gọi xưng trong gia đình'),
    ('Hoạt động gia đình', 'Chia sẻ về các hoạt động thường làm cùng gia đình')
) AS lessons(title, description)
ON CONFLICT DO NOTHING;

-- Thêm câu hỏi mẫu cho bài học "Giới thiệu gia đình"
INSERT INTO questions_speak (lesson_id, question_text, difficulty)
SELECT 
    (SELECT id FROM lessons_speak WHERE title = 'Giới thiệu gia đình' LIMIT 1),
    question_text,
    difficulty
FROM (VALUES
    ('Bạn có thể giới thiệu về gia đình của mình không?', 'easy'),
    ('Người bạn yêu thích nhất trong gia đình là ai? Tại sao?', 'easy'),
    ('Bạn thường làm gì cùng gia đình vào cuối tuần?', 'medium')
) AS questions(question_text, difficulty)
ON CONFLICT DO NOTHING;

-- Thêm câu hỏi mẫu cho bài học "Mối quan hệ gia đình"
INSERT INTO questions_speak (lesson_id, question_text, difficulty)
SELECT 
    (SELECT id FROM lessons_speak WHERE title = 'Mối quan hệ gia đình' LIMIT 1),
    question_text,
    difficulty
FROM (VALUES
    ('Bạn có anh chị em không? Bạn thân thiết với ai nhất?', 'easy'),
    ('Nếu có con, bạn muốn dạy con những giá trị gì?', 'hard'),
    ('Bạn nghĩ gì về việc sống chung với gia đình?', 'medium')
) AS questions(question_text, difficulty)
ON CONFLICT DO NOTHING;

-- Thêm bài học mẫu cho chủ đề Công việc
INSERT INTO lessons_speak (topic_id, title, description)
SELECT 
    (SELECT id FROM topics_speak WHERE title = 'Công việc' LIMIT 1),
    title,
    description
FROM (VALUES
    ('Giới thiệu nghề nghiệp', 'Cách giới thiệu về công việc và nghề nghiệp'),
    ('Môi trường làm việc', 'Thảo luận về môi trường làm việc lý tưởng'),
    ('Thăng tiến nghề nghiệp', 'Chia sẻ về mục tiêu và kế hoạch nghề nghiệp')
) AS lessons(title, description)
ON CONFLICT DO NOTHING;

-- Thêm câu hỏi mẫu cho bài học "Giới thiệu nghề nghiệp"
INSERT INTO questions_speak (lesson_id, question_text, difficulty)
SELECT 
    (SELECT id FROM lessons_speak WHERE title = 'Giới thiệu nghề nghiệp' LIMIT 1),
    question_text,
    difficulty
FROM (VALUES
    ('Bạn làm nghề gì?', 'easy'),
    ('Bạn thích gì nhất về công việc của mình?', 'easy'),
    ('Bạn đã từng thay đổi nghề nghiệp chưa? Tại sao?', 'hard')
) AS questions(question_text, difficulty)
ON CONFLICT DO NOTHING;



