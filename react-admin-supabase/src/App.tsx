import { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Chip,
  Button,
  useTheme,
  alpha,
  Stack,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Person,
  Settings,
  Logout,
  AccountCircle,
  Assessment,
  Book,
  Quiz,
  Language,
  ChevronLeft,
  ChevronRight,
  Notifications,
  Search,
  RecordVoiceOver,
  ExpandLess,
  ExpandMore,
  AutoAwesome,
  Topic as TopicIcon,
  AutoStories as AutoStoriesIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './components/LoginPage';
import UserRoleManager from './components/UserRoleManager';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfilePage from './pages/UserProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import SpeakingPage from './pages/SpeakingPage';
import TopicsPage from './pages/TopicsPage';
import LessonsPage from './pages/LessonsPage';
import QuestionsPage from './pages/QuestionsPage';
import AILessonCreationPage from './pages/AILessonCreationPage';
import AICreateTopicPage from './pages/AICreateTopicPage';
import AICreateLessonPage from './pages/AICreateLessonPage';
import AICreateQuestionPage from './pages/AICreateQuestionPage';
import { checkJWTSession, setupJWTAuthListener } from './utils/jwtAuthManager';
import { debugJWTToken } from './utils/debugJWT';
import { useAuthStore } from './store/authStore';
import type { SimpleUser } from './store/authStore';

// Create beautiful responsive theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          borderRadius: 12,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
          },
        },
      },
    },
  },
});

// Dashboard Component with React Admin Layout
interface DashboardProps {
  user: SimpleUser;
}

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 64;
const DRAWER_WIDTH_MOBILE = 280;

const DashboardContent: React.FC<DashboardProps> = ({ user }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState({
    users: 0,
    wordlists: 0,
    words: 0,
    lessons: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('📊 [DASHBOARD] Dashboard component rendered', { userId: user?.id });

  // Navigation menu items (speaking shown directly, others in collapsible submenu)
  const speakingMenuItems = [
    {
      id: 'topics',
      title: 'Chủ đề Speaking',
      icon: <RecordVoiceOver />,
      path: '/speaking/topics',
      color: theme.palette.primary.main
    },
    {
      id: 'lessons',
      title: 'Bài học Speaking',
      icon: <Book />,
      path: '/speaking/lessons',
      color: theme.palette.info.main
    },
    {
      id: 'questions',
      title: 'Câu hỏi Speaking',
      icon: <Quiz />,
      path: '/speaking/questions',
      color: theme.palette.secondary.main
    }
  ];

  const otherMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: theme.palette.primary.main
    },
    // Speaking AI items moved under Speaking dropdown
    {
      id: 'users',
      title: 'Quản lý người dùng',
      icon: <People />,
      path: '/users',
      color: theme.palette.success.main
    },
    {
      id: 'user-management',
      title: 'Danh sách Users',
      icon: <Person />,
      path: '/user-management',
      color: theme.palette.info.main
    },
    // {
    //   id: 'profile',
    //   title: 'Thông tin cá nhân',
    //   icon: <AccountCircle />,
    //   path: '/profile',
    //   color: theme.palette.warning.main
    // }
  ];

  const [speakingMainOpen, setSpeakingMainOpen] = useState(false);
  const [aiMainOpen, setAiMainOpen] = useState(false);

  const aiMenuItems = [
    {
      id: 'ai-create-topic',
      title: 'AI: Tạo Chủ Đề',
      icon: <TopicIcon />,
      path: '/speaking/ai/create-topic',
      color: theme.palette.secondary.main
    },
    {
      id: 'ai-create-lesson',
      title: 'AI: Tạo Bài Học',
      icon: <AutoStoriesIcon />,
      path: '/speaking/ai/create-lesson',
      color: theme.palette.info.main
    },
    {
      id: 'ai-create-question',
      title: 'AI: Tạo Câu Hỏi',
      icon: <SmartToyIcon />,
      path: '/speaking/ai/create-question',
      color: theme.palette.warning.main
    }
  ];

  const quickActionItems = [
    {
      title: 'Danh sách từ',
      icon: <Book />,
      color: theme.palette.secondary.main,
      description: 'Từ vựng'
    },
    {
      title: 'Từ vựng',
      icon: <Language />,
      color: theme.palette.info.main,
      description: 'Tiếng Trung'
    },
    {
      title: 'Bài học',
      icon: <Assessment />,
      color: theme.palette.success.main,
      description: 'Học tập'
    },
    {
      title: 'Câu hỏi',
      icon: <Quiz />,
      color: theme.palette.warning.main,
      description: 'Kiểm tra'
    }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('📊 [DASHBOARD] Fetching statistics...');
      setLoading(true);

      // Fetch all stats in parallel
      const [usersResult, wordlistsResult, wordsResult, lessonsResult, questionsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('wordlists').select('*', { count: 'exact', head: true }),
        supabase.from('words').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersResult.count || 0,
        wordlists: wordlistsResult.count || 0,
        words: wordsResult.count || 0,
        lessons: lessonsResult.count || 0,
        questions: questionsResult.count || 0
      });

      console.log('✅ [DASHBOARD] Statistics fetched successfully', {
        users: usersResult.count,
        wordlists: wordlistsResult.count,
        words: wordsResult.count,
        lessons: lessonsResult.count,
        questions: questionsResult.count
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ [DASHBOARD] Error fetching statistics', error);
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    console.log('🚪 [DASHBOARD] JWT logout initiated');
    handleMenuClose();
    
    // Import JWT logout function
    const { jwtLogoutWithStore } = await import('./utils/jwtAuthManager');
    await jwtLogoutWithStore();
    window.location.href = '/login';
  };

  const statCards = [
    {
      title: 'Người dùng',
      value: stats.users,
      icon: '👥',
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.1)'
    },
    {
      title: 'Danh sách từ',
      value: stats.wordlists,
      icon: '📚',
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.1)'
    },
    {
      title: 'Từ vựng',
      value: stats.words,
      icon: '🈶',
      color: '#ed6c02',
      bgColor: 'rgba(237, 108, 2, 0.1)'
    },
    {
      title: 'Bài học',
      value: stats.lessons,
      icon: '📖',
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)'
    },
    {
      title: 'Câu hỏi',
      value: stats.questions,
      icon: '❓',
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.1)'
    }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: '100%',
            sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px)`
          },
          ml: {
            xs: 0,
            sm: `${drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px`
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => {
              if (window.innerWidth < 600) {
                setMobileOpen(!mobileOpen);
              } else {
                setDrawerOpen(!drawerOpen);
              }
            }}
            edge="start"
            sx={{
              mr: 2,
              display: { xs: 'block', sm: 'block' },
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1)
              }
            }}
          >
            {drawerOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            🇨🇳 China App Admin Dashboard
          </Typography>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              fontSize: '1rem',
              display: { xs: 'block', sm: 'none' }
            }}
          >
            🇨🇳 Dashboard
          </Typography>

          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <IconButton 
              color="inherit" 
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) } 
              }}
            >
              <Search />
            </IconButton>
            
            <IconButton 
              color="inherit" 
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) } 
              }}
            >
              <Notifications />
            </IconButton>

            <Chip
              icon={<AccountCircle />}
              label={user?.email}
              variant="outlined"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                color: 'white',
                borderColor: alpha(theme.palette.common.white, 0.3),
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '& .MuiChip-icon': { color: 'white' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />

            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1)
                }
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  bgcolor: alpha(theme.palette.common.white, 0.2)
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
                }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Hồ sơ</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cài đặt</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH_MOBILE,
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            📊 Dashboard
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
        
        <List sx={{ px: 1 }}>
          {otherMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive
                      ? alpha(item.color, 0.1)
                      : 'transparent',
                    border: isActive
                      ? `1px solid ${alpha(item.color, 0.2)}`
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha(item.color, 0.05),
                      border: `1px solid ${alpha(item.color, 0.1)}`,
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? item.color : theme.palette.text.secondary,
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? item.color : theme.palette.text.primary
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Collapsible submenu for Speaking */}
          {(() => {
            const isSpeakingActive = speakingMenuItems.some((it) => location.pathname === it.path) || location.pathname === '/speaking';
            const headerColor = isSpeakingActive ? theme.palette.text.primary : theme.palette.text.secondary;
            return (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setSpeakingMainOpen((prev) => !prev)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isSpeakingActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      border: isSpeakingActive ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}` : '1px solid transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ color: headerColor, minWidth: 40 }}>
                      <RecordVoiceOver />
                    </ListItemIcon>
                    <ListItemText
                      primary="Speaking"
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isSpeakingActive ? 600 : 500,
                        color: headerColor
                      }}
                    />
                    {speakingMainOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={speakingMainOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding sx={{ mb: 0.5, pl: 2 }}>
                      <ListItemButton
                        onClick={() => {
                          navigate('/speaking');
                          setMobileOpen(false);
                        }}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          backgroundColor: location.pathname === '/speaking' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          border: location.pathname === '/speaking' ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <ListItemIcon sx={{ color: location.pathname === '/speaking' ? theme.palette.primary.main : theme.palette.text.secondary, minWidth: 40 }}>
                          <RecordVoiceOver />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tổng quan Speaking"
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === '/speaking' ? 600 : 500,
                            color: location.pathname === '/speaking' ? theme.palette.primary.main : theme.palette.text.primary
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    {speakingMenuItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                          <ListItemButton
                            onClick={() => {
                              navigate(item.path);
                              setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: isActive ? alpha(item.color, 0.1) : 'transparent',
                              border: isActive ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: alpha(item.color, 0.05),
                                border: `1px solid ${alpha(item.color, 0.1)}`,
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive ? item.color : theme.palette.text.secondary, minWidth: 40 }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.title}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? item.color : theme.palette.text.primary
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            );
          })()}

          {/* AI Collapsible Root */}
          {(() => {
            const isAIActive = aiMenuItems.some((it) => location.pathname === it.path);
            const headerColor = isAIActive ? theme.palette.text.primary : theme.palette.text.secondary;
            return (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setAiMainOpen((prev) => !prev)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isAIActive ? alpha(theme.palette.secondary.main, 0.06) : 'transparent',
                      border: isAIActive ? `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` : '1px solid transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ color: headerColor, minWidth: 40 }}>
                      <AutoAwesome />
                    </ListItemIcon>
                    <ListItemText
                      primary="AI"
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isAIActive ? 600 : 500,
                        color: headerColor
                      }}
                    />
                    {aiMainOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={aiMainOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {aiMenuItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                          <ListItemButton
                            onClick={() => {
                              navigate(item.path);
                              setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: isActive ? alpha(item.color, 0.1) : 'transparent',
                              border: isActive ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: alpha(item.color, 0.05),
                                border: `1px solid ${alpha(item.color, 0.1)}`,
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive ? item.color : theme.palette.text.secondary, minWidth: 40 }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.title}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? item.color : theme.palette.text.primary
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            );
          })()}
        </List>
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflowX: 'hidden'
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', minHeight: 64 }}>
          {drawerOpen && (
            <Fade in={drawerOpen} timeout={300}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                📊 Dashboard
              </Typography>
            </Fade>
          )}
        </Box>
        
        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
        
        <List sx={{ px: 1 }}>
          {otherMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive
                      ? alpha(item.color, 0.1)
                      : 'transparent',
                    border: isActive
                      ? `1px solid ${alpha(item.color, 0.2)}`
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha(item.color, 0.05),
                      border: `1px solid ${alpha(item.color, 0.1)}`,
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? item.color : theme.palette.text.secondary,
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? item.color : theme.palette.text.primary
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
          {/* Collapsible submenu for Speaking */}
          {(() => {
            const isSpeakingActive = speakingMenuItems.some((it) => location.pathname === it.path) || location.pathname === '/speaking';
            const headerColor = isSpeakingActive ? theme.palette.text.primary : theme.palette.text.secondary;
            return (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setSpeakingMainOpen((prev) => !prev)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isSpeakingActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      border: isSpeakingActive ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}` : '1px solid transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ color: headerColor, minWidth: 40 }}>
                      <RecordVoiceOver />
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary="Speaking"
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: isSpeakingActive ? 600 : 500,
                          color: headerColor
                        }}
                      />
                    )}
                    {speakingMainOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={speakingMainOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding sx={{ mb: 0.5, pl: 2 }}>
                      <ListItemButton
                        onClick={() => navigate('/speaking')}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          backgroundColor: location.pathname === '/speaking' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          border: location.pathname === '/speaking' ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            transform: 'translateX(6px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <ListItemIcon sx={{ color: location.pathname === '/speaking' ? theme.palette.primary.main : theme.palette.text.secondary, minWidth: 40 }}>
                          <RecordVoiceOver />
                        </ListItemIcon>
                        {drawerOpen && (
                          <ListItemText
                            primary="Tổng quan Speaking"
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              fontWeight: location.pathname === '/speaking' ? 600 : 500,
                              color: location.pathname === '/speaking' ? theme.palette.primary.main : theme.palette.text.primary
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                    {speakingMenuItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                          <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: isActive ? alpha(item.color, 0.1) : 'transparent',
                              border: isActive ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: alpha(item.color, 0.05),
                                border: `1px solid ${alpha(item.color, 0.1)}`,
                                transform: 'translateX(6px)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive ? item.color : theme.palette.text.secondary, minWidth: 40 }}>
                              {item.icon}
                            </ListItemIcon>
                            {drawerOpen && (
                              <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{
                                  fontSize: '0.9rem',
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive ? item.color : theme.palette.text.primary
                                }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            );
          })()}

          {/* AI Collapsible Root */}
          {(() => {
            const isAIActive = aiMenuItems.some((it) => location.pathname === it.path);
            const headerColor = isAIActive ? theme.palette.text.primary : theme.palette.text.secondary;
            return (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setAiMainOpen((prev) => !prev)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isAIActive ? alpha(theme.palette.secondary.main, 0.06) : 'transparent',
                      border: isAIActive ? `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` : '1px solid transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ color: headerColor, minWidth: 40 }}>
                      <AutoAwesome />
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary="AI"
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: isAIActive ? 600 : 500,
                          color: headerColor
                        }}
                      />
                    )}
                    {aiMainOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={aiMainOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {aiMenuItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                          <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: isActive ? alpha(item.color, 0.1) : 'transparent',
                              border: isActive ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: alpha(item.color, 0.05),
                                border: `1px solid ${alpha(item.color, 0.1)}`,
                                transform: 'translateX(6px)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive ? item.color : theme.palette.text.secondary, minWidth: 40 }}>
                              {item.icon}
                            </ListItemIcon>
                            {drawerOpen && (
                              <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{
                                  fontSize: '0.9rem',
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive ? item.color : theme.palette.text.primary
                                }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            );
          })()}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px)`
          },
          ml: {
            xs: 0,
            sm: `${drawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px`
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          p: { xs: 1, sm: 2, md: 3, lg: 4 },
          overflow: 'hidden',
          // Ensure main content aligns properly with drawer
          position: 'relative'
        }}
      >
        <Box sx={{ 
          maxWidth: '1200px', 
          mx: 'auto',
          // Ensure content starts immediately after drawer
          position: 'relative',
          zIndex: 1
        }}>
        {/* Welcome Section */}
          <Slide direction="up" in={true} timeout={800}>
            <Card
              elevation={0}
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main})`
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Stack spacing={2}>
                  <Typography 
                    variant="h3" 
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em'
                    }}
                  >
            Chào mừng trở lại! 👋
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.375rem' },
                      fontWeight: 500,
                      opacity: 0.8
                    }}
                  >
            Hệ thống quản trị China App - Tổng quan thống kê
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Slide>

        {/* Loading State */}
        {loading && (
            <Fade in={loading} timeout={500}>
              <Card
                elevation={0}
                sx={{
                  mb: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 4
                }}
              >
                <CardContent sx={{ p: 6, textAlign: 'center' }}>
                  <Stack spacing={3} alignItems="center">
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>⏳</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Đang tải dữ liệu thống kê...
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
        )}

          {/* Stats Grid */}
          {!loading && (
            <Fade in={!loading} timeout={800}>
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, sm: 3 },
                mb: { xs: 3, sm: 4 },
                maxWidth: '1000px',
                mx: 'auto'
              }}>
                {statCards.map((card, index) => (
                  <Slide direction="up" in={!loading} timeout={600 + index * 100} key={index}>
                    <Card
                      elevation={0}
                      sx={{
                        width: { xs: '140px', sm: '160px', md: '180px' },
                        height: { xs: '120px', sm: '140px', md: '160px' },
                        background: `linear-gradient(135deg, ${card.bgColor}, ${alpha(theme.palette.background.paper, 0.8)})`,
                        border: `2px solid ${alpha(card.color, 0.2)}`,
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: card.color
                        },
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 24px ${alpha(card.color, 0.3)}`,
                          border: `2px solid ${alpha(card.color, 0.4)}`
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Stack spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
                          <Typography variant="h2" sx={{ 
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            lineHeight: 1
                          }}>
                            {card.icon}
                          </Typography>
                          
                          <Typography 
                            variant="h4" 
                            sx={{
                              fontWeight: 800,
                              color: card.color,
                              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                              lineHeight: 1
                            }}
                          >
                            {card.value.toLocaleString()}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                              lineHeight: 1,
                              textAlign: 'center'
                            }}
                          >
                            {card.title}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Slide>
                ))}
              </Box>
            </Fade>
          )}

        {/* Quick Actions */}
          <Slide direction="up" in={true} timeout={1000}>
            <Card
              elevation={0}
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.info.main})`
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 }, pb: { xs: 4, sm: 5 } }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    textAlign: 'center'
                  }}
                >
                  Thao tác nhanh
                </Typography>
          
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: { xs: 2, sm: 3 },
                  maxWidth: '800px',
                  mx: 'auto'
                }}>
                  {quickActionItems.map((action, index) => (
                    <Button
                      key={index}
                      variant="contained"
                      startIcon={action.icon}
                      sx={{
                        minWidth: { xs: 140, sm: 160 },
                        maxWidth: { xs: 160, sm: 180 },
                        height: { xs: 80, sm: 90 },
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${action.color} 0%, ${alpha(action.color, 0.8)} 100%)`,
                        boxShadow: `0 4px 12px ${alpha(action.color, 0.3)}`,
                        border: `1px solid ${alpha(action.color, 0.2)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(action.color, 0.9)} 0%, ${action.color} 100%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${alpha(action.color, 0.4)}`,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: 'white',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            textAlign: 'center'
                          }}
                        >
                          {action.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            fontWeight: 500,
                            textAlign: 'center',
                            display: { xs: 'none', sm: 'block' }
                          }}
                        >
                          {action.description}
                        </Typography>
                      </Stack>
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Slide>

        {/* System Info */}
          <Slide direction="up" in={true} timeout={1200}>
            <Card
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}>
                    <Assessment sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.info.main,
                        mb: 0.5
                      }}
                    >
                      Thông tin hệ thống
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      Ứng dụng đang chạy ở chế độ phát triển. Tất cả dữ liệu được lưu trữ trên Supabase Cloud Database.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Slide>
        </Box>
      </Box>
    </Box>
  );
};

// Wrapper component to provide Router context
const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return <DashboardContent user={user} />;
};

function App() {
  // Sử dụng Zustand store thay vì useState
  const { isAuthenticated, user } = useAuthStore();

  console.log('🚀 [APP] China App starting up...');
  console.log('🎨 [APP] Theme loaded:', { 
    primary: theme.palette.primary.main,
    mode: theme.palette.mode,
    fontFamily: theme.typography.fontFamily
  });

  useEffect(() => {
    console.log('🔍 [APP] Initializing app with JWT...');
    
    // Debug JWT token in storage
    debugJWTToken();
    
    // Check JWT session khi app khởi động
    checkJWTSession().then((session) => {
      console.log('📋 [APP] Initial JWT session state:', session);
    }).catch((error) => {
      console.error('❌ [APP] Error checking JWT session:', error);
    });

    // Setup JWT auth listener (no-op for stateless JWT)
    const subscription = setupJWTAuthListener((newAuthState) => {
      console.log('🔄 [APP] JWT auth state updated:', newAuthState);
      // Store sẽ tự động update, không cần setState
    });

    return () => {
      console.log('🧹 [APP] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <LoginPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <Dashboard user={user!} />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/users" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <UserRoleManager />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <UserProfilePage user={user!} />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/user-management" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <UserManagementPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <SpeakingPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/topics" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <TopicsPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/lessons" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <LessonsPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/questions" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <QuestionsPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/ai-lesson-creation" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <AILessonCreationPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/ai/create-topic" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <AICreateTopicPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/ai/create-lesson" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <AICreateLessonPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/speaking/ai/create-question" 
            element={
              isAuthenticated ? (
                <ProtectedRoute>
                  <AICreateQuestionPage />
                </ProtectedRoute>
              ) : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;