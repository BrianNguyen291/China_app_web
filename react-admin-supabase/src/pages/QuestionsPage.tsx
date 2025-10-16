import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
  Fab,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  PlayArrow as PlayIcon,
  Book as BookIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Topic {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  topic?: Topic;
}

interface Question {
  id: string;
  lesson_id: string;
  position: number;
  prompt: string;
  simplified_text: string;
  traditional_text: string;
  phonetic: string;
  image_url: string;
  exam: string;
  kind: string;
  explanation: string;
  created_at: string;
}

const QuestionsPage: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({ 
    position: 1,
    prompt: '',
    simplified_text: '',
    traditional_text: '',
    phonetic: '',
    image_url: '',
    exam: 'OTHER',
    kind: 'mcq',
    explanation: ''
  });
  
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');

  useEffect(() => {
    if (lessonId) {
      fetchLessonAndQuestions();
    } else {
      navigate('/speaking/topics');
    }
  }, [lessonId]);

  const fetchLessonAndQuestions = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      
      // Fetch lesson info with topic
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons_speak')
        .select(`
          id, topic_id, title, description,
          topics_speak(id, name)
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson({ ...lessonData, topic: lessonData.topics_speak });

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions_speak')
        .select('id, lesson_id, position, prompt, simplified_text, traditional_text, phonetic, image_url, exam, kind, explanation, created_at')
        .eq('lesson_id', lessonId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!lessonId) return;

    try {
      const payload = {
        lesson_id: lessonId,
        position: Number(questionForm.position) || 1,
        prompt: questionForm.prompt?.trim() || '',
        simplified_text: questionForm.simplified_text?.trim() || '',
        traditional_text: questionForm.traditional_text?.trim() || '',
        phonetic: questionForm.phonetic?.trim() || '',
        image_url: questionForm.image_url?.trim() || '',
        exam: questionForm.exam?.trim() || 'OTHER',
        kind: questionForm.kind?.trim() || 'mcq',
        explanation: questionForm.explanation?.trim() || '',
      };

      const { data, error } = await supabase
        .from('questions_speak')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setQuestionForm({ position: 1, prompt: '', simplified_text: '', traditional_text: '', phonetic: '', image_url: '', exam: 'OTHER', kind: 'mcq', explanation: '' });
      setQuestionDialogOpen(false);
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const payload = {
        position: Number(questionForm.position) || 1,
        prompt: questionForm.prompt?.trim() || '',
        simplified_text: questionForm.simplified_text?.trim() || '',
        traditional_text: questionForm.traditional_text?.trim() || '',
        phonetic: questionForm.phonetic?.trim() || '',
        image_url: questionForm.image_url?.trim() || '',
        exam: questionForm.exam?.trim() || 'OTHER',
        kind: questionForm.kind?.trim() || 'mcq',
        explanation: questionForm.explanation?.trim() || '',
      };

      const { data, error } = await supabase
        .from('questions_speak')
        .update(payload)
        .eq('id', editingQuestion.id)
        .select()
        .single();

      if (error) throw error;

      setQuestions(questions.map(q => q.id === editingQuestion.id ? data : q));
      setQuestionForm({ position: 1, prompt: '', simplified_text: '', traditional_text: '', phonetic: '', image_url: '', exam: 'OTHER', kind: 'mcq', explanation: '' });
      setEditingQuestion(null);
      setQuestionDialogOpen(false);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions_speak')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const openQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({ 
        position: question.position ?? 1,
        prompt: question.prompt || '',
        simplified_text: question.simplified_text || '',
        traditional_text: question.traditional_text || '',
        phonetic: question.phonetic || '',
        image_url: question.image_url || '',
        exam: question.exam || 'OTHER',
        kind: question.kind || 'mcq',
        explanation: question.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({ position: 1, prompt: '', simplified_text: '', traditional_text: '', phonetic: '', image_url: '', exam: 'OTHER', kind: 'mcq', explanation: '' });
    }
    setQuestionDialogOpen(true);
  };

  const handleBackToLessons = () => {
    if (lesson?.topic_id) {
      navigate(`/speaking/lessons?topicId=${lesson.topic_id}`);
    } else {
      navigate('/speaking/topics');
    }
  };

  const handleBackToTopics = () => {
    navigate('/speaking/topics');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToTopics}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Chủ đề
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToLessons}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <BookIcon fontSize="small" />
            {lesson?.topic?.name || 'Chủ đề'}
          </Link>
          <Typography color="text.primary">
            {lesson?.title || 'Đang tải...'}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            borderRadius: 3
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.secondary.main, 0.1)
              }}>
                <QuizIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  ❓ Câu hỏi: {lesson?.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {lesson?.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Chủ đề: {lesson?.topic?.title}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openQuestionDialog()}
                size="large"
                color="secondary"
              >
                Thêm câu hỏi mới
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            {loading ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Đang tải danh sách câu hỏi...
              </Typography>
            ) : questions.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Chưa có câu hỏi nào trong bài học này. Hãy tạo câu hỏi đầu tiên!
              </Alert>
            ) : (
              <List>
                {questions.map((question) => (
                  <ListItem
                    key={question.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {question.prompt}
                          </Typography>
                          <Chip
                            label={`vị trí: ${question.position}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`loại: ${question.kind}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`exam: ${question.exam}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.disabled">
                          Tạo lúc: {new Date(question.created_at).toLocaleString('vi-VN')}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => openQuestionDialog(question)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteQuestion(question.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        {questions.length > 0 && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              bgcolor: theme.palette.success.main,
              '&:hover': {
                bgcolor: theme.palette.success.dark
              }
            }}
          >
            <Tooltip title="Bắt đầu luyện nói">
              <PlayIcon />
            </Tooltip>
          </Fab>
        )}
      </Stack>

      {/* Question Dialog */}
      <Dialog 
        open={questionDialogOpen} 
        onClose={() => setQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Vị trí"
              value={questionForm.position}
              onChange={(e) => setQuestionForm({ ...questionForm, position: Number(e.target.value) })}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Câu hỏi (Prompt)"
              value={questionForm.prompt}
              onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
              placeholder="Nhập câu hỏi luyện nói..."
            />
            <TextField
              fullWidth
              label="Văn bản giản thể"
              value={questionForm.simplified_text}
              onChange={(e) => setQuestionForm({ ...questionForm, simplified_text: e.target.value })}
              placeholder="简体中文文本..."
            />
            <TextField
              fullWidth
              label="Văn bản phồn thể"
              value={questionForm.traditional_text}
              onChange={(e) => setQuestionForm({ ...questionForm, traditional_text: e.target.value })}
              placeholder="繁體中文文本..."
            />
            <TextField
              fullWidth
              label="Phiên âm"
              value={questionForm.phonetic}
              onChange={(e) => setQuestionForm({ ...questionForm, phonetic: e.target.value })}
              placeholder="pinyin hoặc IPA..."
            />
            <TextField
              fullWidth
              label="URL hình ảnh"
              value={questionForm.image_url}
              onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <TextField
              select
              fullWidth
              label="Loại bài thi"
              value={questionForm.exam}
              onChange={(e) => setQuestionForm({ ...questionForm, exam: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="OTHER">Khác</option>
              <option value="HSK1">HSK 1</option>
              <option value="HSK2">HSK 2</option>
              <option value="HSK3">HSK 3</option>
              <option value="HSK4">HSK 4</option>
              <option value="HSK5">HSK 5</option>
              <option value="HSK6">HSK 6</option>
            </TextField>
            <TextField
              select
              fullWidth
              label="Loại câu hỏi"
              value={questionForm.kind}
              onChange={(e) => setQuestionForm({ ...questionForm, kind: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="mcq">Trắc nghiệm</option>
              <option value="open">Tự luận</option>
              <option value="speaking">Luyện nói</option>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Giải thích"
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              placeholder="Giải thích chi tiết cho câu hỏi..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
            disabled={!questionForm.prompt.trim()}
            color="secondary"
          >
            {editingQuestion ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsPage;
