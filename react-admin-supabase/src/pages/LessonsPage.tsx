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
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Lesson {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  position: number;
  is_public: boolean;
  created_at: string;
  questions_count?: number;
}

const LessonsPage: React.FC = () => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ slug: '', title: '', description: '', level: '', position: 1, is_public: true });
  
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topicId');

  useEffect(() => {
    if (topicId) {
      fetchTopicAndLessons();
    } else {
      navigate('/speaking/topics');
    }
  }, [topicId]);

  const fetchTopicAndLessons = async () => {
    if (!topicId) return;

    try {
      setLoading(true);
      
      // Fetch topic info
      const { data: topicData, error: topicError } = await supabase
        .from('topics_speak')
        .select('id, name, description')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      setTopic(topicData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons_speak')
        .select(`
          id, topic_id, slug, title, description, level, position, is_public, created_at,
          questions_speak(count)
        `)
        .eq('topic_id', topicId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (lessonsError) throw lessonsError;

      const lessonsWithCount = lessonsData?.map(lesson => ({
        ...lesson,
        questions_count: lesson.questions_speak?.[0]?.count || 0
      })) || [];

      setLessons(lessonsWithCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleCreateLesson = async () => {
    if (!topicId) return;

    try {
      const payload = {
        topic_id: topicId,
        slug: lessonForm.slug?.trim() || toSlug(lessonForm.title || ''),
        title: lessonForm.title?.trim(),
        description: lessonForm.description?.trim() || '',
        level: lessonForm.level?.trim() || '',
        position: Number(lessonForm.position) || 1,
        is_public: Boolean(lessonForm.is_public),
      };

      const { data, error } = await supabase
        .from('lessons_speak')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setLessons([...lessons, { ...data, questions_count: 0 }]);
      setLessonForm({ slug: '', title: '', description: '', level: '', position: 1, is_public: true });
      setLessonDialogOpen(false);
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    try {
      const payload = {
        slug: lessonForm.slug?.trim() || toSlug(lessonForm.title || ''),
        title: lessonForm.title?.trim(),
        description: lessonForm.description?.trim() || '',
        level: lessonForm.level?.trim() || '',
        position: Number(lessonForm.position) || 1,
        is_public: Boolean(lessonForm.is_public),
      };

      const { data, error } = await supabase
        .from('lessons_speak')
        .update(payload)
        .eq('id', editingLesson.id)
        .select()
        .single();

      if (error) throw error;

      setLessons(lessons.map(l => l.id === editingLesson.id ? { ...data, questions_count: l.questions_count } : l));
      setLessonForm({ slug: '', title: '', description: '', level: '', position: 1, is_public: true });
      setEditingLesson(null);
      setLessonDialogOpen(false);
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons_speak')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const openLessonDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ slug: lesson.slug || '', title: lesson.title || '', description: lesson.description || '', level: lesson.level || '', position: lesson.position ?? 1, is_public: !!lesson.is_public });
    } else {
      setEditingLesson(null);
      setLessonForm({ slug: '', title: '', description: '', level: '', position: 1, is_public: true });
    }
    setLessonDialogOpen(true);
  };

  const handleViewQuestions = (lessonId: string) => {
    navigate(`/speaking/questions?lessonId=${lessonId}`);
  };

  const handleBackToTopics = () => {
    navigate('/speaking/topics');
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
          <Typography color="text.primary">
            {topic?.name || 'Đang tải...'}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: 3
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.info.main, 0.1)
              }}>
                <BookIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  📖 Bài học: {topic?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {topic?.description}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openLessonDialog()}
                size="large"
                color="info"
              >
                Thêm bài học mới
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            {loading ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Đang tải danh sách bài học...
              </Typography>
            ) : lessons.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Chưa có bài học nào trong chủ đề này. Hãy tạo bài học đầu tiên!
              </Alert>
            ) : (
              <List>
                {lessons.map((lesson) => (
                  <ListItem
                    key={lesson.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {lesson.title}
                          </Typography>
                          <Chip 
                            label={`slug: ${lesson.slug}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`level: ${lesson.level || 'N/A'}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`vị trí: ${lesson.position}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={lesson.is_public ? 'công khai' : 'riêng tư'} 
                            size="small" 
                            color={lesson.is_public ? 'success' : 'default'}
                            variant="outlined"
                          />
                          <Chip 
                            label={`${lesson.questions_count || 0} câu hỏi`} 
                            size="small" 
                            color="info"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Tạo lúc: {new Date(lesson.created_at).toLocaleString('vi-VN')}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowForwardIcon />}
                          onClick={() => handleViewQuestions(lesson.id)}
                          size="small"
                          color="info"
                        >
                          Xem câu hỏi
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => openLessonDialog(lesson)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLesson(lesson.id)}
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
      </Stack>

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
              label="Slug"
              value={lessonForm.slug}
              onChange={(e) => setLessonForm({ ...lessonForm, slug: e.target.value })}
              placeholder="tu-dong-tao-tu-ten-neu-de-trong"
            />
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
            <TextField
              fullWidth
              label="Trình độ (level)"
              value={lessonForm.level}
              onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
              placeholder="Ví dụ: A1, A2, B1, ..."
            />
            <TextField
              fullWidth
              type="number"
              label="Vị trí"
              value={lessonForm.position}
              onChange={(e) => setLessonForm({ ...lessonForm, position: Number(e.target.value) })}
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Công khai"
              value={lessonForm.is_public ? 'true' : 'false'}
              onChange={(e) => setLessonForm({ ...lessonForm, is_public: e.target.value === 'true' })}
              helperText="nhập 'true' hoặc 'false'"
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
            color="info"
          >
            {editingLesson ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonsPage;
