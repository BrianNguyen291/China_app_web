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
  Fab,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RecordVoiceOver as SpeakingIcon,
  Topic as TopicIcon,
  Quiz as QuizIcon,
  PlayArrow as PlayIcon,
  Book
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

interface Topic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  lessons_count?: number;
}

interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  created_at: string;
  questions_count?: number;
}

interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

const SpeakingPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '' });
  const [questionForm, setQuestionForm] = useState({ 
    question_text: '', 
    difficulty: 'easy' as 'easy' | 'medium' | 'hard' 
  });

  const theme = useTheme();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchLessons(selectedTopic.id);
      setSelectedLesson(null);
      setQuestions([]);
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedLesson) {
      fetchQuestions(selectedLesson.id);
    }
  }, [selectedLesson]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics_speak')
        .select(`
          *,
          speaking_lessons(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const topicsWithCount = data?.map(topic => ({
        ...topic,
        lessons_count: topic.speaking_lessons?.[0]?.count || 0
      })) || [];

      setTopics(topicsWithCount);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('speaking_lessons')
        .select(`
          *,
          speaking_questions(count)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const lessonsWithCount = data?.map(lesson => ({
        ...lesson,
        questions_count: lesson.speaking_questions?.[0]?.count || 0
      })) || [];

      setLessons(lessonsWithCount);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchQuestions = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('speaking_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const { data, error } = await supabase
        .from('topics_speak')
        .insert([topicForm])
        .select()
        .single();

      if (error) throw error;

      setTopics([{ ...data, lessons_count: 0 }, ...topics]);
      setTopicForm({ title: '', description: '' });
      setTopicDialogOpen(false);
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;

    try {
      const { data, error } = await supabase
        .from('topics_speak')
        .update(topicForm)
        .eq('id', editingTopic.id)
        .select()
        .single();

      if (error) throw error;

      setTopics(topics.map(t => t.id === editingTopic.id ? { ...data, lessons_count: t.lessons_count } : t));
      setTopicForm({ title: '', description: '' });
      setEditingTopic(null);
      setTopicDialogOpen(false);
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('topics_speak')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      setTopics(topics.filter(t => t.id !== topicId));
      if (selectedTopic?.id === topicId) {
        setSelectedTopic(null);
        setSelectedLesson(null);
        setLessons([]);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedTopic) return;

    try {
      const { data, error } = await supabase
        .from('speaking_lessons')
        .insert([{ ...lessonForm, topic_id: selectedTopic.id }])
        .select()
        .single();

      if (error) throw error;

      setLessons([...lessons, { ...data, questions_count: 0 }]);
      setLessonForm({ title: '', description: '' });
      setLessonDialogOpen(false);
      
      // Update topic lessons count
      setTopics(topics.map(t => 
        t.id === selectedTopic.id 
          ? { ...t, lessons_count: (t.lessons_count || 0) + 1 }
          : t
      ));
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    try {
      const { data, error } = await supabase
        .from('speaking_lessons')
        .update(lessonForm)
        .eq('id', editingLesson.id)
        .select()
        .single();

      if (error) throw error;

      setLessons(lessons.map(l => l.id === editingLesson.id ? { ...data, questions_count: l.questions_count } : l));
      setLessonForm({ title: '', description: '' });
      setEditingLesson(null);
      setLessonDialogOpen(false);
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('speaking_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      setLessons(lessons.filter(l => l.id !== lessonId));
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
        setQuestions([]);
      }

      // Update topic lessons count
      if (selectedTopic) {
        setTopics(topics.map(t => 
          t.id === selectedTopic.id 
            ? { ...t, lessons_count: Math.max((t.lessons_count || 0) - 1, 0) }
            : t
        ));
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedLesson) return;

    try {
      const { data, error } = await supabase
        .from('speaking_questions')
        .insert([{ ...questionForm, lesson_id: selectedLesson.id }])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setQuestionForm({ question_text: '', difficulty: 'easy' });
      setQuestionDialogOpen(false);
      
      // Update lesson questions count
      setLessons(lessons.map(l => 
        l.id === selectedLesson.id 
          ? { ...l, questions_count: (l.questions_count || 0) + 1 }
          : l
      ));
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const { data, error } = await supabase
        .from('speaking_questions')
        .update(questionForm)
        .eq('id', editingQuestion.id)
        .select()
        .single();

      if (error) throw error;

      setQuestions(questions.map(q => q.id === editingQuestion.id ? data : q));
      setQuestionForm({ question_text: '', difficulty: 'easy' });
      setEditingQuestion(null);
      setQuestionDialogOpen(false);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('speaking_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
      
      // Update lesson questions count
      if (selectedLesson) {
        setLessons(lessons.map(l => 
          l.id === selectedLesson.id 
            ? { ...l, questions_count: Math.max((l.questions_count || 0) - 1, 0) }
            : l
        ));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const openTopicDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({ title: topic.title, description: topic.description });
    } else {
      setEditingTopic(null);
      setTopicForm({ title: '', description: '' });
    }
    setTopicDialogOpen(true);
  };

  const openLessonDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ title: lesson.title, description: lesson.description });
    } else {
      setEditingLesson(null);
      setLessonForm({ title: '', description: '' });
    }
    setLessonDialogOpen(true);
  };

  const openQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({ 
        question_text: question.question_text, 
        difficulty: question.difficulty 
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({ question_text: '', difficulty: 'easy' });
    }
    setQuestionDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}>
                <SpeakingIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  🎤 Speaking Practice
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý chủ đề và câu hỏi luyện nói tiếng Trung
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Topics Section */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TopicIcon color="primary" />
                    Chủ đề ({topics.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openTopicDialog()}
                    size="small"
                  >
                    Thêm chủ đề
                  </Button>
                </Stack>

                {loading ? (
                  <Typography color="text.secondary">Đang tải...</Typography>
                ) : topics.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chưa có chủ đề nào. Hãy tạo chủ đề đầu tiên!
                  </Alert>
                ) : (
                  <List>
                    {topics.map((topic) => (
                      <React.Fragment key={topic.id}>
                        <ListItem
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: selectedTopic?.id === topic.id 
                              ? alpha(theme.palette.primary.main, 0.1)
                              : 'transparent',
                            border: selectedTopic?.id === topic.id 
                              ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                              : '1px solid transparent',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }
                          }}
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {topic.title}
                                </Typography>
                                <Chip 
                                  label={`${topic.lessons_count || 0} bài`} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={topic.description}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTopicDialog(topic);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTopic(topic.id);
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Lessons Section */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Book color="info" />
                    Bài học ({lessons.length})
                  </Typography>
                  {selectedTopic && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openLessonDialog()}
                      size="small"
                      color="info"
                    >
                      Thêm bài học
                    </Button>
                  )}
                </Stack>

                {!selectedTopic ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chọn một chủ đề để xem bài học
                  </Alert>
                ) : lessons.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chưa có bài học nào trong chủ đề này
                  </Alert>
                ) : (
                  <List>
                    {lessons.map((lesson) => (
                      <React.Fragment key={lesson.id}>
                        <ListItem
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: selectedLesson?.id === lesson.id 
                              ? alpha(theme.palette.info.main, 0.1)
                              : 'transparent',
                            border: selectedLesson?.id === lesson.id 
                              ? `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                              : '1px solid transparent',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                            }
                          }}
                          onClick={() => setSelectedLesson(lesson)}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {lesson.title}
                                </Typography>
                                <Chip 
                                  label={`${lesson.questions_count || 0} câu`} 
                                  size="small" 
                                  color="info"
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={lesson.description}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLessonDialog(lesson);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(lesson.id);
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Questions Section */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card elevation={0} sx={{ height: '100%', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizIcon color="secondary" />
                    Câu hỏi ({questions.length})
                  </Typography>
                  {selectedLesson && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openQuestionDialog()}
                      size="small"
                      color="secondary"
                    >
                      Thêm câu hỏi
                    </Button>
                  )}
                </Stack>

                {!selectedLesson ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chọn một bài học để xem câu hỏi
                  </Alert>
                ) : questions.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chưa có câu hỏi nào trong bài học này
                  </Alert>
                ) : (
                  <List>
                    {questions.map((question) => (
                      <React.Fragment key={question.id}>
                        <ListItem
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                  {question.question_text}
                                </Typography>
                                <Chip
                                  label={question.difficulty}
                                  size="small"
                                  sx={{
                                    bgcolor: getDifficultyColor(question.difficulty),
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
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
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Floating Action Button */}
        {selectedLesson && (
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

      {/* Topic Dialog */}
      <Dialog 
        open={topicDialogOpen} 
        onClose={() => setTopicDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTopic ? 'Chỉnh sửa chủ đề' : 'Tạo chủ đề mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên chủ đề"
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              placeholder="Ví dụ: Gia đình, Công việc, Du lịch..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mô tả chủ đề"
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              placeholder="Mô tả ngắn về chủ đề này..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
            disabled={!topicForm.title.trim()}
          >
            {editingTopic ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

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
              multiline
              rows={3}
              label="Câu hỏi"
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              placeholder="Nhập câu hỏi luyện nói..."
            />
            <TextField
              select
              fullWidth
              label="Độ khó"
              value={questionForm.difficulty}
              onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })}
              SelectProps={{ native: true }}
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
            disabled={!questionForm.question_text.trim()}
          >
            {editingQuestion ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog 
        open={lessonDialogOpen} 
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingLesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên bài học"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              placeholder="Ví dụ: Bài 1: Giới thiệu bản thân..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mô tả bài học"
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              placeholder="Mô tả ngắn về bài học này..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={editingLesson ? handleUpdateLesson : handleCreateLesson}
            disabled={!lessonForm.title.trim()}
          >
            {editingLesson ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpeakingPage;
