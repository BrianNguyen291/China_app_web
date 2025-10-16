import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Fab,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Topic as TopicIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  AutoStories as AutoStoriesIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Topic {
  id: string;
  name: string;
  description: string;
  position: number;
  created_at: string;
}

interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  level: string;
  position: number;
  is_public: boolean;
  created_at: string;
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

interface AIGenerationConfig {
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  questionCount: number;
  questionTypes: string[];
  language: 'simplified' | 'traditional' | 'both';
  includeImages: boolean;
  includeAudio: boolean;
  examType: string;
}

const AILessonCreationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [aiConfig, setAiConfig] = useState<AIGenerationConfig>({
    difficulty: 'A2',
    topic: '',
    questionCount: 5,
    questionTypes: ['speaking', 'mcq'],
    language: 'simplified',
    includeImages: false,
    includeAudio: false,
    examType: 'HSK3'
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics_speak')
        .select('*')
        .order('position', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons_speak')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions_speak')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const simulateAIGeneration = async (type: 'topic' | 'lesson' | 'question') => {
    setAiGenerating(true);
    setGenerationProgress(0);
    setGeneratedContent(null);

    const steps = {
      topic: ['Phân tích yêu cầu...', 'Tạo chủ đề phù hợp...', 'Tối ưu nội dung...', 'Hoàn thành!'],
      lesson: ['Phân tích chủ đề...', 'Tạo bài học...', 'Thêm mô tả...', 'Tối ưu cấu trúc...', 'Hoàn thành!'],
      question: ['Phân tích bài học...', 'Tạo câu hỏi...', 'Thêm đáp án...', 'Tạo giải thích...', 'Tối ưu nội dung...', 'Hoàn thành!']
    };

    const currentSteps = steps[type];
    
    for (let i = 0; i < currentSteps.length; i++) {
      setGenerationStep(currentSteps[i]);
      setGenerationProgress((i + 1) * (100 / currentSteps.length));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Simulate AI-generated content
    const mockContent = {
      topic: {
        name: `Chủ đề AI: ${aiConfig.topic || 'Giao tiếp hàng ngày'}`,
        description: `Đây là chủ đề được tạo bởi AI về ${aiConfig.topic || 'giao tiếp hàng ngày'} với trình độ ${aiConfig.difficulty}. Chủ đề này bao gồm các tình huống thực tế và từ vựng phù hợp với trình độ học viên.`,
        position: topics.length + 1
      },
      lesson: {
        title: `Bài học AI: ${aiConfig.topic || 'Giao tiếp cơ bản'}`,
        description: `Bài học được tạo bởi AI với ${aiConfig.questionCount} câu hỏi ở trình độ ${aiConfig.difficulty}. Bài học tập trung vào ${aiConfig.topic || 'giao tiếp hàng ngày'} và sử dụng ${aiConfig.language === 'both' ? 'cả chữ giản thể và phồn thể' : aiConfig.language === 'simplified' ? 'chữ giản thể' : 'chữ phồn thể'}.`,
        level: aiConfig.difficulty,
        position: 1,
        is_public: true
      },
      question: {
        questions: Array.from({ length: aiConfig.questionCount }, (_, i) => ({
          position: i + 1,
          prompt: `Câu hỏi ${i + 1}: Hãy mô tả về ${aiConfig.topic || 'gia đình của bạn'} bằng tiếng Trung ở trình độ ${aiConfig.difficulty}`,
          simplified_text: `${aiConfig.topic || '家庭'} - ${aiConfig.difficulty}级词汇`,
          traditional_text: `${aiConfig.topic || '家庭'} - ${aiConfig.difficulty}級詞彙`,
          phonetic: `jiā tíng - ${aiConfig.difficulty} jí cí huì`,
          exam: aiConfig.examType,
          kind: aiConfig.questionTypes[i % aiConfig.questionTypes.length],
          explanation: `Đây là câu hỏi AI tạo ra để luyện tập ${aiConfig.topic || 'gia đình'} ở trình độ ${aiConfig.difficulty}. Học viên sẽ học được từ vựng và cách diễn đạt phù hợp.`
        }))
      }
    };

    setGeneratedContent(mockContent[type]);
    setAiGenerating(false);
    setGenerationProgress(0);
    setGenerationStep('');
  };

  const saveAIContent = async (type: 'topic' | 'lesson' | 'question') => {
    if (!generatedContent) return;

    try {
      if (type === 'topic') {
        const { data, error } = await supabase
          .from('topics_speak')
          .insert([generatedContent])
          .select()
          .single();

        if (error) throw error;
        setTopics([...topics, data]);
        setAiConfig(prev => ({ ...prev, topic: data.name }));
      } else if (type === 'lesson') {
        // Need to select a topic first
        if (topics.length === 0) {
          alert('Vui lòng tạo chủ đề trước khi tạo bài học');
          return;
        }
        
        const selectedTopic = topics[0]; // Use first topic for demo
        const { data, error } = await supabase
          .from('lessons_speak')
          .insert([{ ...generatedContent, topic_id: selectedTopic.id }])
          .select()
          .single();

        if (error) throw error;
        setLessons([...lessons, data]);
      } else if (type === 'question') {
        // Need to select a lesson first
        if (lessons.length === 0) {
          alert('Vui lòng tạo bài học trước khi tạo câu hỏi');
          return;
        }

        const selectedLesson = lessons[0]; // Use first lesson for demo
        const questionsToInsert = generatedContent.questions.map((q: any) => ({
          ...q,
          lesson_id: selectedLesson.id
        }));

        const { data, error } = await supabase
          .from('questions_speak')
          .insert(questionsToInsert)
          .select();

        if (error) throw error;
        setQuestions([...questions, ...data]);
      }

      setGeneratedContent(null);
      alert(`${type === 'topic' ? 'Chủ đề' : type === 'lesson' ? 'Bài học' : 'Câu hỏi'} đã được lưu thành công!`);
    } catch (error) {
      console.error('Error saving AI content:', error);
      alert('Có lỗi xảy ra khi lưu nội dung');
    }
  };

  const handleBackToTopics = () => {
    navigate('/speaking');
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

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
            Speaking
          </Link>
          <Typography color="text.primary">
            AI Tạo Bài Học
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
            }
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}>
                <AIIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  🤖 AI Tạo Bài Học Thông Minh
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sử dụng trí tuệ nhân tạo để tạo chủ đề, bài học và câu hỏi một cách tự động
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                  size="large"
                >
                  Làm mới
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AIIcon />}
                  onClick={() => setActiveTab(0)}
                  size="large"
                  color="secondary"
                >
                  Bắt đầu AI
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* AI Generation Progress */}
        {aiGenerating && (
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} />
                  <Typography variant="h6" color="info.main">
                    AI đang tạo nội dung...
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={generationProgress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {generationStep}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Main Content with Tabs */}
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<TopicIcon />} 
                label="Tạo Chủ Đề AI" 
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
              <Tab 
                icon={<BookIcon />} 
                label="Tạo Bài Học AI" 
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
              <Tab 
                icon={<QuizIcon />} 
                label="Tạo Câu Hỏi AI" 
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
              <Tab 
                icon={<TuneIcon />} 
                label="Cấu Hình AI" 
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            </Tabs>
          </Box>

          {/* Tab 1: AI Topic Creation */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <PsychologyIcon color="primary" />
                    <Typography variant="h6" color="primary">
                      Tạo Chủ Đề Thông Minh
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI sẽ phân tích và tạo chủ đề phù hợp với trình độ học viên
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Chủ đề mong muốn"
                        value={aiConfig.topic}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="Ví dụ: Gia đình, Công việc, Du lịch..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LightbulbIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Trình độ</InputLabel>
                        <Select
                          value={aiConfig.difficulty}
                          label="Trình độ"
                          onChange={(e) => setAiConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        >
                          <MenuItem value="A1">A1 - Cơ bản</MenuItem>
                          <MenuItem value="A2">A2 - Sơ cấp</MenuItem>
                          <MenuItem value="B1">B1 - Trung cấp</MenuItem>
                          <MenuItem value="B2">B2 - Trung cao cấp</MenuItem>
                          <MenuItem value="C1">C1 - Cao cấp</MenuItem>
                          <MenuItem value="C2">C2 - Thành thạo</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AIIcon />}
                      onClick={() => simulateAIGeneration('topic')}
                      disabled={aiGenerating}
                      size="large"
                    >
                      Tạo Chủ Đề AI
                    </Button>
                    {generatedContent && (
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={() => saveAIContent('topic')}
                        color="success"
                        size="large"
                      >
                        Lưu Chủ Đề
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card elevation={0} sx={{ border: `2px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="h6" color="success.main">
                        Chủ Đề Đã Tạo
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {generatedContent.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {generatedContent.description}
                    </Typography>
                    <Chip 
                      label={`Vị trí: ${generatedContent.position}`} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 2: AI Lesson Creation */}
          <TabPanel value={activeTab} index={1}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <AutoStoriesIcon color="info" />
                    <Typography variant="h6" color="info.main">
                      Tạo Bài Học Thông Minh
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI sẽ tạo bài học hoàn chỉnh với cấu trúc và nội dung phù hợp
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Chủ đề bài học"
                        value={aiConfig.topic}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="Chủ đề cho bài học..."
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số câu hỏi"
                        value={aiConfig.questionCount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
                        inputProps={{ min: 1, max: 20 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Loại bài thi</InputLabel>
                        <Select
                          value={aiConfig.examType}
                          label="Loại bài thi"
                          onChange={(e) => setAiConfig(prev => ({ ...prev, examType: e.target.value }))}
                        >
                          <MenuItem value="HSK1">HSK 1</MenuItem>
                          <MenuItem value="HSK2">HSK 2</MenuItem>
                          <MenuItem value="HSK3">HSK 3</MenuItem>
                          <MenuItem value="HSK4">HSK 4</MenuItem>
                          <MenuItem value="HSK5">HSK 5</MenuItem>
                          <MenuItem value="HSK6">HSK 6</MenuItem>
                          <MenuItem value="OTHER">Khác</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AIIcon />}
                      onClick={() => simulateAIGeneration('lesson')}
                      disabled={aiGenerating}
                      size="large"
                      color="info"
                    >
                      Tạo Bài Học AI
                    </Button>
                    {generatedContent && (
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={() => saveAIContent('lesson')}
                        color="success"
                        size="large"
                      >
                        Lưu Bài Học
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card elevation={0} sx={{ border: `2px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="h6" color="success.main">
                        Bài Học Đã Tạo
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {generatedContent.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {generatedContent.description}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`Trình độ: ${generatedContent.level}`} size="small" />
                      <Chip label={`Vị trí: ${generatedContent.position}`} size="small" />
                      <Chip 
                        label={generatedContent.is_public ? 'Công khai' : 'Riêng tư'} 
                        size="small" 
                        color={generatedContent.is_public ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 3: AI Question Creation */}
          <TabPanel value={activeTab} index={2}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <SmartToyIcon color="warning" />
                    <Typography variant="h6" color="warning.main">
                      Tạo Câu Hỏi Thông Minh
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI sẽ tạo bộ câu hỏi đa dạng với đáp án và giải thích chi tiết
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số câu hỏi"
                        value={aiConfig.questionCount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
                        inputProps={{ min: 1, max: 50 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Loại câu hỏi</InputLabel>
                        <Select
                          multiple
                          value={aiConfig.questionTypes}
                          label="Loại câu hỏi"
                          onChange={(e) => setAiConfig(prev => ({ ...prev, questionTypes: e.target.value as string[] }))}
                        >
                          <MenuItem value="speaking">Luyện nói</MenuItem>
                          <MenuItem value="mcq">Trắc nghiệm</MenuItem>
                          <MenuItem value="open">Tự luận</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Loại chữ</InputLabel>
                        <Select
                          value={aiConfig.language}
                          label="Loại chữ"
                          onChange={(e) => setAiConfig(prev => ({ ...prev, language: e.target.value as any }))}
                        >
                          <MenuItem value="simplified">Giản thể</MenuItem>
                          <MenuItem value="traditional">Phồn thể</MenuItem>
                          <MenuItem value="both">Cả hai</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack spacing={1}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={aiConfig.includeImages}
                              onChange={(e) => setAiConfig(prev => ({ ...prev, includeImages: e.target.checked }))}
                            />
                          }
                          label="Bao gồm hình ảnh"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={aiConfig.includeAudio}
                              onChange={(e) => setAiConfig(prev => ({ ...prev, includeAudio: e.target.checked }))}
                            />
                          }
                          label="Bao gồm âm thanh"
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AIIcon />}
                      onClick={() => simulateAIGeneration('question')}
                      disabled={aiGenerating}
                      size="large"
                      color="warning"
                    >
                      Tạo Câu Hỏi AI
                    </Button>
                    {generatedContent && (
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={() => saveAIContent('question')}
                        color="success"
                        size="large"
                      >
                        Lưu Câu Hỏi
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {generatedContent && (
                <Card elevation={0} sx={{ border: `2px solid ${alpha(theme.palette.success.main, 0.3)}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="h6" color="success.main">
                        Câu Hỏi Đã Tạo ({generatedContent.questions.length} câu)
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      {generatedContent.questions.map((question: any, index: number) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Câu {question.position}: {question.prompt.substring(0, 50)}...
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
                              <Typography variant="body2">
                                <strong>Câu hỏi:</strong> {question.prompt}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Giản thể:</strong> {question.simplified_text}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Phồn thể:</strong> {question.traditional_text}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Phiên âm:</strong> {question.phonetic}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Giải thích:</strong> {question.explanation}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip label={`Loại: ${question.kind}`} size="small" />
                                <Chip label={`Exam: ${question.exam}`} size="small" />
                              </Stack>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 4: AI Configuration */}
          <TabPanel value={activeTab} index={3}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <TuneIcon color="action" />
                    <Typography variant="h6">
                      Cấu Hình AI Nâng Cao
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Tùy chỉnh các tham số để AI tạo nội dung phù hợp với nhu cầu
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Cài Đặt Cơ Bản
                      </Typography>
                      <Stack spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel>Trình độ mặc định</InputLabel>
                          <Select
                            value={aiConfig.difficulty}
                            label="Trình độ mặc định"
                            onChange={(e) => setAiConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          >
                            <MenuItem value="A1">A1 - Cơ bản</MenuItem>
                            <MenuItem value="A2">A2 - Sơ cấp</MenuItem>
                            <MenuItem value="B1">B1 - Trung cấp</MenuItem>
                            <MenuItem value="B2">B2 - Trung cao cấp</MenuItem>
                            <MenuItem value="C1">C1 - Cao cấp</MenuItem>
                            <MenuItem value="C2">C2 - Thành thạo</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          fullWidth
                          label="Số câu hỏi mặc định"
                          type="number"
                          value={aiConfig.questionCount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
                          inputProps={{ min: 1, max: 100 }}
                        />

                        <FormControl fullWidth>
                          <InputLabel>Loại bài thi mặc định</InputLabel>
                          <Select
                            value={aiConfig.examType}
                            label="Loại bài thi mặc định"
                            onChange={(e) => setAiConfig(prev => ({ ...prev, examType: e.target.value }))}
                          >
                            <MenuItem value="HSK1">HSK 1</MenuItem>
                            <MenuItem value="HSK2">HSK 2</MenuItem>
                            <MenuItem value="HSK3">HSK 3</MenuItem>
                            <MenuItem value="HSK4">HSK 4</MenuItem>
                            <MenuItem value="HSK5">HSK 5</MenuItem>
                            <MenuItem value="HSK6">HSK 6</MenuItem>
                            <MenuItem value="OTHER">Khác</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Tùy Chọn Nâng Cao
                      </Typography>
                      <Stack spacing={2}>
                        <FormControl fullWidth>
                          <FormLabel>Loại câu hỏi ưa thích</FormLabel>
                          <RadioGroup
                            value={aiConfig.questionTypes[0]}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, questionTypes: [e.target.value] }))}
                          >
                            <FormControlLabel value="speaking" control={<Radio />} label="Luyện nói" />
                            <FormControlLabel value="mcq" control={<Radio />} label="Trắc nghiệm" />
                            <FormControlLabel value="open" control={<Radio />} label="Tự luận" />
                          </RadioGroup>
                        </FormControl>

                        <FormControl fullWidth>
                          <FormLabel>Loại chữ Trung Quốc</FormLabel>
                          <RadioGroup
                            value={aiConfig.language}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, language: e.target.value as any }))}
                          >
                            <FormControlLabel value="simplified" control={<Radio />} label="Chữ giản thể" />
                            <FormControlLabel value="traditional" control={<Radio />} label="Chữ phồn thể" />
                            <FormControlLabel value="both" control={<Radio />} label="Cả hai" />
                          </RadioGroup>
                        </FormControl>

                        <Stack spacing={1}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={aiConfig.includeImages}
                                onChange={(e) => setAiConfig(prev => ({ ...prev, includeImages: e.target.checked }))}
                              />
                            }
                            label="Bao gồm hình ảnh minh họa"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={aiConfig.includeAudio}
                                onChange={(e) => setAiConfig(prev => ({ ...prev, includeAudio: e.target.checked }))}
                              />
                            }
                            label="Bao gồm file âm thanh"
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Card elevation={0} sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <CardContent>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {topics.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chủ đề đã tạo
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Card elevation={0} sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                    <CardContent>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {lessons.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bài học đã tạo
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Card elevation={0} sx={{ textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                    <CardContent>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                        {questions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Câu hỏi đã tạo
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Stack>
          </TabPanel>
        </Card>
      </Stack>

      {/* Floating Action Button */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: theme.palette.secondary.main,
          '&:hover': {
            bgcolor: theme.palette.secondary.dark
          }
        }}
      >
        <Tooltip title="Trợ lý AI">
          <AIIcon />
        </Tooltip>
      </Fab>
    </Box>
  );
};

export default AILessonCreationPage;
