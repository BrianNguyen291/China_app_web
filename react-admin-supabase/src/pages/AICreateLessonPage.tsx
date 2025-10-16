import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, TextField, Button, Chip, Breadcrumbs, Link, Avatar, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Home as HomeIcon, Save as SaveIcon, Refresh as RefreshIcon, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Search as SearchIcon, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface TopicRow {
  id: string;
  name: string;
}

interface LessonRow {
  id: string;
  topic_id: string | null;
  name: string;
  short_description: string | null;
  long_description: string | null;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const AICreateLessonPage: React.FC = () => {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{ topic_id: string | ''; name: string; short_description: string; long_description: string; image: string }>({
    topic_id: '',
    name: '',
    short_description: '',
    long_description: '',
    image: '',
  });
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) => (l.name || '').toLowerCase().includes(q) || (l.short_description || '').toLowerCase().includes(q));
  }, [lessons, search]);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => { fetchInitial(); }, []);

  const fetchInitial = async () => {
    setLoading(true);
    const [{ data: topicsData }, { data: lessonsData }] = await Promise.all([
      supabase.from('ai_learn_topics').select('id, name').order('name', { ascending: true }),
      supabase.from('ai_learn_lessons').select('id, topic_id, name, short_description, long_description, image, created_at, updated_at').order('created_at', { ascending: false }),
    ]);
    setTopics(topicsData || []);
    setLessons(lessonsData || []);
    setLoading(false);
  };

  const handleBack = () => navigate('/speaking');

  const resetForm = () => {
    setEditingId(null);
    setFormValues({ topic_id: '', name: '', short_description: '', long_description: '', image: '' });
    setDialogOpen(false);
  };

  const onEdit = (row: LessonRow) => {
    setEditingId(row.id);
    setFormValues({
      topic_id: row.topic_id || '',
      name: row.name || '',
      short_description: row.short_description || '',
      long_description: row.long_description || '',
      image: row.image || '',
    });
    setDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Xóa bài học này?');
    if (!ok) return;
    const { error } = await supabase.from('ai_learn_lessons').delete().eq('id', id);
    if (!error) {
      setLessons((prev) => prev.filter((l) => l.id !== id));
      setSnackbar({ open: true, message: 'Đã xóa bài học', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Xóa thất bại', severity: 'error' });
    }
  };

  const onSubmit = async () => {
    if (!formValues.name.trim()) return;
    const payload = { ...formValues };
    if (isEditing && editingId) {
      const { data, error } = await supabase
        .from('ai_learn_lessons')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();
      if (!error && data) {
        setLessons((prev) => prev.map((l) => (l.id === editingId ? (data as LessonRow) : l)));
        setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('ai_learn_lessons')
        .insert([{ ...payload }])
        .select()
        .single();
      if (!error && data) {
        setLessons((prev) => [data as LessonRow, ...prev]);
        setSnackbar({ open: true, message: 'Tạo mới thành công', severity: 'success' });
        resetForm();
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" variant="body1" onClick={handleBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="small" />
            Speaking
          </Link>
          <Typography color="text.primary">Quản Lý Bài Học</Typography>
        </Breadcrumbs>
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.info.main, 0.1), border: `2px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
              L
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Quản lý Bài Học</Typography>
              <Typography variant="body2" color="text.secondary">Tạo, chỉnh sửa và quản lý bài học trong bảng ai_learn_lessons</Typography>
            </Box>
            <TextField size="small" placeholder="Tìm kiếm bài học..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }} sx={{ minWidth: 280 }} />
            <Tooltip title="Tạo bài học">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setDialogOpen(true); }}>Thêm mới</Button>
            </Tooltip>
            <Tooltip title="Làm mới">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInitial}>Làm mới</Button>
            </Tooltip>
          </Stack>
        </Card>

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onClose={resetForm} fullWidth maxWidth="sm">
          <DialogTitle>{isEditing ? 'Cập Nhật Bài Học' : 'Thêm Bài Học Mới'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Chủ đề</InputLabel>
                <Select value={formValues.topic_id} label="Chủ đề" onChange={(e) => setFormValues((p) => ({ ...p, topic_id: String(e.target.value) }))}>
                  <MenuItem value=""><em>Không chọn</em></MenuItem>
                  {topics.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField fullWidth autoFocus label="Tên bài học" value={formValues.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, name: e.target.value }))} />
              <TextField fullWidth label="Mô tả ngắn" value={formValues.short_description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, short_description: e.target.value }))} />
              <TextField fullWidth label="Mô tả dài" multiline minRows={4} value={formValues.long_description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, long_description: e.target.value }))} />
              <TextField fullWidth label="Ảnh (URL)" value={formValues.image} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, image: e.target.value }))} InputProps={{ startAdornment: (<InputAdornment position="start"><ImageIcon fontSize="small" /></InputAdornment>) }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">Xem trước:</Typography>
                <Avatar src={formValues.image || undefined} alt="preview" sx={{ width: 48, height: 48 }} />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Hủy</Button>
            <Button onClick={onSubmit} variant="contained" startIcon={<SaveIcon />} disabled={!formValues.name.trim()}> {isEditing ? 'Lưu' : 'Tạo mới'} </Button>
          </DialogActions>
        </Dialog>

        {/* List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="h6">Danh sách bài học</Typography>
              <Chip label={`${filteredLessons.length}`} size="small" />
            </Stack>
            <Stack spacing={2}>
              {loading && <Typography variant="body2" color="text.secondary">Đang tải...</Typography>}
              {!loading && filteredLessons.map((l) => (
                <Box key={l.id} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Avatar src={l.image || undefined} sx={{ width: 40, height: 40 }}>{(!l.image && l.name) ? l.name.charAt(0) : ''}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{l.name}</Typography>
                      {l.short_description && (
                        <Typography variant="body2" color="text.secondary">{l.short_description}</Typography>
                      )}
                      {l.long_description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{l.long_description}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Tạo: {l.created_at ? new Date(l.created_at).toLocaleString() : '-'} {l.updated_at ? `• Cập nhật: ${new Date(l.updated_at).toLocaleString()}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => onEdit(l)} aria-label="edit"><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => onDelete(l.id)} aria-label="delete"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              {!loading && filteredLessons.length === 0 && (
                <Typography variant="body2" color="text.secondary">Chưa có bài học.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default AICreateLessonPage;


