import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, TextField, Button, Chip, Breadcrumbs, Link, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tooltip, InputAdornment } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { AutoAwesome as AIIcon, Home as HomeIcon, Save as SaveIcon, Refresh as RefreshIcon, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Cancel as CancelIcon, Search as SearchIcon, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface TopicRow {
  id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// interface AIGenerationConfig {
//   difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
//   topic: string;
// }

const AICreateTopicPage: React.FC = () => {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // AI generation removed for now; use simple CRUD form instead

  // Form state for create/update
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<{ name: string; short_description: string; long_description: string; image: string }>({
    name: '',
    short_description: '',
    long_description: '',
    image: '',
  });
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const [search, setSearch] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );
  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => (t.name || '').toLowerCase().includes(q) || (t.short_description || '').toLowerCase().includes(q));
  }, [topics, search]);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_learn_topics')
      .select('id, name, short_description, long_description, image, created_at, updated_at')
      .order('created_at', { ascending: true });
    if (!error) setTopics(data || []);
    setLoading(false);
  };

  const handleBack = () => navigate('/speaking');

  // (Optional) AI helper previously used here

  const resetForm = () => {
    setEditingId(null);
    setFormValues({ name: '', short_description: '', long_description: '', image: '' });
    setDialogOpen(false);
  };

  const onEdit = (row: TopicRow) => {
    setEditingId(row.id);
    setFormValues({
      name: row.name || '',
      short_description: row.short_description || '',
      long_description: row.long_description || '',
      image: row.image || '',
    });
    setDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Xóa chủ đề này?');
    if (!ok) return;
    const { error } = await supabase.from('ai_learn_topics').delete().eq('id', id);
    if (!error) {
      setTopics((prev) => prev.filter((t) => t.id !== id));
      setSnackbar({ open: true, message: 'Đã xóa chủ đề', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Xóa thất bại', severity: 'error' });
    }
  };

  const onSubmit = async () => {
    if (!formValues.name.trim()) return;
    const nowValues = { ...formValues };
    if (isEditing && editingId) {
      const { data, error } = await supabase
        .from('ai_learn_topics')
        .update({ ...nowValues, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();
      if (!error && data) {
        setTopics((prev) => prev.map((t) => (t.id === editingId ? (data as TopicRow) : t)));
        setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('ai_learn_topics')
        .insert([{ ...nowValues }])
        .select()
        .single();
      if (!error && data) {
        setTopics((prev) => [...prev, data as TopicRow]);
        setSnackbar({ open: true, message: 'Tạo mới thành công', severity: 'success' });
        resetForm();
      }
    }
  };

  // (Optional) handler to merge AI output into form was removed

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" variant="body1" onClick={handleBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="small" />
            Speaking
          </Link>
          <Typography color="text.primary">AI Tạo Chủ Đề</Typography>
        </Breadcrumbs>

        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.secondary.main, 0.1), border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
              <AIIcon sx={{ color: theme.palette.secondary.main, fontSize: 26 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Quản lý Chủ Đề Học</Typography>
              <Typography variant="body2" color="text.secondary">Tạo, chỉnh sửa và quản lý chủ đề trong bảng ai_learn_topics</Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Tìm kiếm chủ đề..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              sx={{ minWidth: 280 }}
            />
            <Tooltip title="Tạo chủ đề">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setDialogOpen(true); }}>
                Thêm mới
              </Button>
            </Tooltip>
            <Tooltip title="Làm mới">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTopics}>Làm mới</Button>
            </Tooltip>
          </Stack>
        </Card>

        {/* AI progress section removed */}

       

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onClose={resetForm} fullWidth maxWidth="sm">
          <DialogTitle>{isEditing ? 'Cập Nhật Chủ Đề' : 'Thêm Chủ Đề Mới'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                autoFocus
                label="Tên chủ đề"
                value={formValues.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Mô tả ngắn"
                value={formValues.short_description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, short_description: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Mô tả dài"
                multiline
                minRows={4}
                value={formValues.long_description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, long_description: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Ảnh (URL)"
                value={formValues.image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, image: e.target.value }))}
                InputProps={{ startAdornment: (<InputAdornment position="start"><ImageIcon fontSize="small" /></InputAdornment>) }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">Xem trước:</Typography>
                <Avatar src={formValues.image || undefined} alt="preview" sx={{ width: 48, height: 48 }} />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm} startIcon={<CancelIcon />}>Hủy</Button>
            <Button onClick={onSubmit} variant="contained" startIcon={<SaveIcon />} disabled={!formValues.name.trim()}>
              {isEditing ? 'Lưu' : 'Tạo mới'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI preview card removed */}

        {/* List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="h6">Danh sách chủ đề</Typography>
              <Chip label={`${filteredTopics.length}`} size="small" />
            </Stack>
            <Stack spacing={2}>
              {loading && (
                <Typography variant="body2" color="text.secondary">Đang tải...</Typography>
              )}
              {!loading && filteredTopics.map((t) => (
                <Box key={t.id} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Avatar src={t.image || undefined} sx={{ width: 40, height: 40 }}>{(!t.image && t.name) ? t.name.charAt(0) : ''}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {t.short_description && (
                          <Typography variant="body2" color="text.secondary">{t.short_description}</Typography>
                        )}
                      </Stack>
                      {t.long_description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {t.long_description}
                        </Typography>
                      )}
                      {t.image && (
                        <Typography variant="caption" color="text.secondary">Ảnh: {t.image}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Tạo: {t.created_at ? new Date(t.created_at).toLocaleString() : '-'} {t.updated_at ? `• Cập nhật: ${new Date(t.updated_at).toLocaleString()}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => onEdit(t)} aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => onDelete(t.id)} aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              {!loading && filteredTopics.length === 0 && (
                <Typography variant="body2" color="text.secondary">Chưa có chủ đề nào.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default AICreateTopicPage;


