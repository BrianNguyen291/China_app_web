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
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Topic as TopicIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Topic {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
  created_at: string;
  lessons_count?: number;
}

const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ slug: '', name: '', description: '', position: 1 });
  
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('topics_speak')
        .select(`
          id, slug, name, description, position, created_at,
          lessons_speak(count)
        `)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const topicsWithCount = data?.map(topic => ({
        ...topic,
        lessons_count: topic.lessons_speak?.[0]?.count || 0
      })) || [];

      setTopics(topicsWithCount);
    } catch (error) {
      console.error('Error fetching topics:', error);
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

  const handleCreateTopic = async () => {
    try {
      const payload = {
        slug: topicForm.slug?.trim() || toSlug(topicForm.name || ''),
        name: topicForm.name?.trim(),
        description: topicForm.description?.trim() || '',
        position: Number(topicForm.position) || 1,
      };

      const { data, error } = await supabase
        .from('topics_speak')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setTopics([{ ...data, lessons_count: 0 }, ...topics]);
      setTopicForm({ slug: '', name: '', description: '', position: 1 });
      setTopicDialogOpen(false);
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;

    try {
      const payload = {
        slug: topicForm.slug?.trim() || toSlug(topicForm.name || ''),
        name: topicForm.name?.trim(),
        description: topicForm.description?.trim() || '',
        position: Number(topicForm.position) || 1,
      };

      const { data, error } = await supabase
        .from('topics_speak')
        .update(payload)
        .eq('id', editingTopic.id)
        .select()
        .single();

      if (error) throw error;

      setTopics(topics.map(t => t.id === editingTopic.id ? { ...data, lessons_count: t.lessons_count } : t));
      setTopicForm({ slug: '', name: '', description: '', position: 1 });
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
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const openTopicDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({ slug: topic.slug || '', name: topic.name || '', description: topic.description || '', position: topic.position ?? 1 });
    } else {
      setEditingTopic(null);
      setTopicForm({ slug: '', name: '', description: '', position: 1 });
    }
    setTopicDialogOpen(true);
  };

  const handleViewLessons = (topicId: string) => {
    navigate(`/speaking/lessons?topicId=${topicId}`);
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
                <TopicIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  📚 Quản lý Chủ đề
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tạo và quản lý các chủ đề luyện nói tiếng Trung
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openTopicDialog()}
                size="large"
              >
                Thêm chủ đề mới
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Topics List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            {loading ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Đang tải danh sách chủ đề...
              </Typography>
            ) : topics.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Chưa có chủ đề nào. Hãy tạo chủ đề đầu tiên!
              </Alert>
            ) : (
              <List>
                {topics.map((topic) => (
                  <ListItem
                    key={topic.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {topic.name}
                          </Typography>
                          <Chip 
                            label={`slug: ${topic.slug}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`vị trí: ${topic.position}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${topic.lessons_count || 0} bài học`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {topic.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Tạo lúc: {new Date(topic.created_at).toLocaleString('vi-VN')}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowForwardIcon />}
                          onClick={() => handleViewLessons(topic.id)}
                          size="small"
                        >
                          Xem bài học
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => openTopicDialog(topic)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTopic(topic.id)}
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
              label="Slug"
              value={topicForm.slug}
              onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })}
              placeholder="tu-dong-tao-tu-ten-neu-de-trong"
            />
            <TextField
              fullWidth
              label="Tên chủ đề"
              value={topicForm.name}
              onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
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
            <TextField
              fullWidth
              type="number"
              label="Vị trí"
              value={topicForm.position}
              onChange={(e) => setTopicForm({ ...topicForm, position: Number(e.target.value) })}
              inputProps={{ min: 1 }}
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
            disabled={!topicForm.name.trim()}
          >
            {editingTopic ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicsPage;
