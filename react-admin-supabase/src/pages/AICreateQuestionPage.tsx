import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, TextField, Button, Chip, Breadcrumbs, Link, Avatar, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Home as HomeIcon, Save as SaveIcon, Refresh as RefreshIcon, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Lesson { id: string; name: string; }

interface QuestionRow {
  id: string;
  lesson_id: string;
  vi_question: string | null;
  zh_question: string | null;
  pinyin: string | null;
  en_question: string | null;
  vi_answer: string | null;
  zh_answer: string | null;
  pinyin_answer: string | null;
  en_answer: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const AICreateQuestionPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Omit<QuestionRow, 'id' | 'created_at' | 'updated_at'>>({
    lesson_id: '',
    vi_question: '',
    zh_question: '',
    pinyin: '',
    en_question: '',
    vi_answer: '',
    zh_answer: '',
    pinyin_answer: '',
    en_answer: '',
  });
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });
  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter((x) => (x.vi_question || '').toLowerCase().includes(q) || (x.zh_question || '').toLowerCase().includes(q) || (x.en_question || '').toLowerCase().includes(q));
  }, [questions, search]);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => { fetchInitial(); }, []);

  const fetchInitial = async () => {
    setLoading(true);
    const [{ data: lessonsData }, { data: questionsData }] = await Promise.all([
      supabase.from('ai_learn_lessons').select('id, name').order('created_at', { ascending: false }),
      supabase.from('ai_learn_questions').select('id, lesson_id, vi_question, zh_question, pinyin, en_question, vi_answer, zh_answer, pinyin_answer, en_answer, created_at, updated_at').order('created_at', { ascending: false }),
    ]);
    setLessons((lessonsData as any) || []);
    setQuestions((questionsData as any) || []);
    setLoading(false);
  };

  const handleBack = () => navigate('/speaking');

  const resetForm = () => {
    setEditingId(null);
    setFormValues({
      lesson_id: '',
      vi_question: '',
      zh_question: '',
      pinyin: '',
      en_question: '',
      vi_answer: '',
      zh_answer: '',
      pinyin_answer: '',
      en_answer: '',
    });
    setDialogOpen(false);
  };

  const onEdit = (row: QuestionRow) => {
    setEditingId(row.id);
    setFormValues({
      lesson_id: row.lesson_id,
      vi_question: row.vi_question || '',
      zh_question: row.zh_question || '',
      pinyin: row.pinyin || '',
      en_question: row.en_question || '',
      vi_answer: row.vi_answer || '',
      zh_answer: row.zh_answer || '',
      pinyin_answer: row.pinyin_answer || '',
      en_answer: row.en_answer || '',
    });
    setDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Xóa câu hỏi này?');
    if (!ok) return;
    const { error } = await supabase.from('ai_learn_questions').delete().eq('id', id);
    if (!error) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSnackbar({ open: true, message: 'Đã xóa câu hỏi', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Xóa thất bại', severity: 'error' });
    }
  };

  const onSubmit = async () => {
    if (!formValues.lesson_id) {
      setSnackbar({ open: true, message: 'Vui lòng chọn bài học', severity: 'error' });
      return;
    }
    const payload = { ...formValues };
    if (isEditing && editingId) {
      const { data, error } = await supabase
        .from('ai_learn_questions')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single();
      if (!error && data) {
        setQuestions((prev) => prev.map((q) => (q.id === editingId ? (data as QuestionRow) : q)));
        setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('ai_learn_questions')
        .insert([{ ...payload }])
        .select()
        .single();
      if (!error && data) {
        setQuestions((prev) => [data as QuestionRow, ...prev]);
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
          <Typography color="text.primary">Quản Lý Câu Hỏi</Typography>
        </Breadcrumbs>
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.warning.main, 0.1), border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>Q</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>Quản lý Câu Hỏi</Typography>
              <Typography variant="body2" color="text.secondary">CRUD cho bảng ai_learn_questions, liên kết ai_learn_lessons</Typography>
            </Box>
            <TextField size="small" placeholder="Tìm kiếm câu hỏi..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }} sx={{ minWidth: 280 }} />
            <Tooltip title="Tạo câu hỏi">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setDialogOpen(true); }}>Thêm mới</Button>
            </Tooltip>
            <Tooltip title="Làm mới">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInitial}>Làm mới</Button>
            </Tooltip>
          </Stack>
        </Card>

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onClose={resetForm} fullWidth maxWidth="md">
          <DialogTitle>{isEditing ? 'Cập Nhật Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Bài học</InputLabel>
                <Select value={formValues.lesson_id} label="Bài học" onChange={(e) => setFormValues((p) => ({ ...p, lesson_id: String(e.target.value) }))}>
                  <MenuItem value=""><em>Chọn bài học</em></MenuItem>
                  {lessons.map((l) => (<MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>))}
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Câu hỏi (VI)" value={formValues.vi_question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, vi_question: e.target.value }))} />
                <TextField fullWidth label="Câu hỏi (ZH)" value={formValues.zh_question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, zh_question: e.target.value }))} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Pinyin" value={formValues.pinyin || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, pinyin: e.target.value }))} />
                <TextField fullWidth label="Question (EN)" value={formValues.en_question || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, en_question: e.target.value }))} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Đáp án (VI)" value={formValues.vi_answer || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, vi_answer: e.target.value }))} />
                <TextField fullWidth label="Đáp án (ZH)" value={formValues.zh_answer || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, zh_answer: e.target.value }))} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Answer Pinyin" value={formValues.pinyin_answer || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, pinyin_answer: e.target.value }))} />
                <TextField fullWidth label="Answer (EN)" value={formValues.en_answer || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues((p) => ({ ...p, en_answer: e.target.value }))} />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Hủy</Button>
            <Button onClick={onSubmit} variant="contained" startIcon={<SaveIcon />} disabled={!formValues.lesson_id}> {isEditing ? 'Lưu' : 'Tạo mới'} </Button>
          </DialogActions>
        </Dialog>

        {/* List */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="h6">Danh sách câu hỏi</Typography>
              <Chip label={`${filteredQuestions.length}`} size="small" />
            </Stack>
            <Stack spacing={2}>
              {loading && <Typography variant="body2" color="text.secondary">Đang tải...</Typography>}
              {!loading && filteredQuestions.map((q) => (
                <Box key={q.id} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{q.vi_question || q.en_question || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">ZH: {q.zh_question || '—'} | Pinyin: {q.pinyin || '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">ANS VI: {q.vi_answer || '—'} | ZH: {q.zh_answer || '—'} | EN: {q.en_answer || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Tạo: {q.created_at ? new Date(q.created_at).toLocaleString() : '-'} {q.updated_at ? `• Cập nhật: ${new Date(q.updated_at).toLocaleString()}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => onEdit(q)} aria-label="edit"><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton size="small" color="error" onClick={() => onDelete(q.id)} aria-label="delete"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              {!loading && filteredQuestions.length === 0 && (
                <Typography variant="body2" color="text.secondary">Chưa có câu hỏi.</Typography>
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

export default AICreateQuestionPage;


