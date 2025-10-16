import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Fade,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Login as LoginIcon,
  AdminPanelSettings,
  Palette,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { jwtLoginWithStore, clearJWTLocalSession } from '../utils/jwtAuthManager';
import { useAuthStore } from '../store/authStore';
import { debugJWTToken, clearAllJWTData, testJWTGeneration } from '../utils/debugJWT';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Sử dụng store cho loading và error
  const { loading, error, setLoading, setError } = useAuthStore();

  console.log('🔐 [LOGIN] LoginPage component rendered');
  console.log('🔐 [LOGIN] Current store state:', {
    loading: loading,
    error: error,
    isAuthenticated: useAuthStore.getState().isAuthenticated,
    hasUser: !!useAuthStore.getState().user,
    hasToken: !!useAuthStore.getState().token
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 [LOGIN] Login attempt started', { 
      email,
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });

    // Debug JWT token trước khi login
    console.log('🔍 [LOGIN] Debug JWT token before login:');
    debugJWTToken();

    try {
      console.log('🔄 [LOGIN] Calling jwtLoginWithStore...');
      
      // Sử dụng JWT login
      const result = await jwtLoginWithStore(email, password);
      
      console.log('📋 [LOGIN] JWT login result:', result);
      
      if (!result.success) {
        console.error('❌ [LOGIN] JWT login failed:', result.error);
        setError(result.error || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }

      console.log('🎉 [LOGIN] JWT login successful');
      
      // Debug JWT token sau khi login thành công
      console.log('🔍 [LOGIN] Debug JWT token after successful login:');
      debugJWTToken();
      
      // Check store state sau khi login
      const storeState = useAuthStore.getState();
      console.log('🏪 [LOGIN] Store state after login:', {
        isAuthenticated: storeState.isAuthenticated,
        hasUser: !!storeState.user,
        hasToken: !!storeState.token,
        userEmail: storeState.user?.email,
        userRole: storeState.user?.role
      });
      
      // Navigate to dashboard
      console.log('🚀 [LOGIN] Navigating to dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ [LOGIN] JWT login error', error);
      console.error('❌ [LOGIN] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message || 'Đã xảy ra lỗi khi đăng nhập');
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `
          radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '8px', sm: '16px', md: '24px' },
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflow: 'auto',
        // Reset body styles that might interfere
        '& *': {
          boxSizing: 'border-box',
        }
      }}
    >
      <Container 
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '480px', md: '520px' },
          padding: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Slide direction="up" in={true} timeout={800}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              maxHeight: { xs: '95vh', sm: '90vh', md: '85vh' },
              overflow: 'auto',
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: { xs: 3, sm: 4, md: 5 },
              boxShadow: `
                0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)},
                0 10px 10px -5px ${alpha(theme.palette.common.black, 0.04)},
                0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}
              `,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
              }
            }}
          >
            <CardHeader
              sx={{
                textAlign: 'center',
                pb: 0,
                pt: { xs: 4, sm: 5, md: 6 }
              }}
              title={
                <Stack spacing={2} alignItems="center">
                  <Fade in={true} timeout={1200}>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: { xs: 80, sm: 90, md: 100 },
                          height: { xs: 80, sm: 90, md: 100 },
                          boxShadow: `
                            0 8px 32px ${alpha(theme.palette.primary.main, 0.3)},
                            0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}
                          `,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        }}
                      >
                        <AdminPanelSettings sx={{ 
                          fontSize: { xs: 40, sm: 45, md: 50 },
                          color: 'white'
                        }} />
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                        }}
                      >
                        <Security sx={{ fontSize: 14, color: 'white' }} />
                      </Box>
                    </Box>
                  </Fade>
                  
                  <Stack spacing={1} alignItems="center">
                    <Typography
                      variant="h3"
                      component="h1"
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
                      🇨🇳 China App
                    </Typography>
                    
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                        opacity: 0.9
                      }}
                    >
                      Hệ thống quản trị
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        opacity: 0.8,
                        fontWeight: 500
                      }}
                    >
                      Đăng nhập với tài khoản quản trị viên
                    </Typography>
                  </Stack>
                </Stack>
              }
            />
            
            <Divider sx={{ 
              mx: 3,
              borderColor: alpha(theme.palette.divider, 0.1),
              '&::before, &::after': {
                borderColor: alpha(theme.palette.divider, 0.1)
              }
            }} />

          {/* Error Alert */}
          {error && (
            <Alert 
              severity={error.includes('không có quyền') ? 'warning' : 'error'}
              sx={{ 
                mb: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  fontWeight: error.includes('không có quyền') ? 600 : 400,
                },
                '& .MuiAlert-icon': {
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                }
              }}
              icon={error.includes('không có quyền') ? '🚫' : undefined}
            >
              {error.includes('không có quyền') ? (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    🚫 Không có quyền truy cập
                  </Typography>
                  <Typography variant="body2">
                    Tài khoản của bạn không có quyền truy cập vào hệ thống quản trị. 
                    Vui lòng liên hệ quản trị viên để được cấp quyền.
                  </Typography>
                </Box>
              ) : (
                error
              )}
            </Alert>
          )}

            <CardContent sx={{ pt: 3, pb: 4 }}>
              {/* Error Alert */}
              {error && (
                <Fade in={!!error} timeout={500}>
                  <Alert 
                    severity={error.includes('không có quyền') ? 'warning' : 'error'}
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.1)}`,
                      '& .MuiAlert-message': {
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        fontWeight: error.includes('không có quyền') ? 600 : 400,
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Địa chỉ email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        height: { xs: 56, sm: 60, md: 64 },
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                        },
                        '&.Mui-focused': {
                          backgroundColor: theme.palette.background.paper,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        fontWeight: 500
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email 
                            sx={{ 
                              fontSize: { xs: '1.25rem', sm: '1.375rem' },
                              color: theme.palette.primary.main
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        height: { xs: 56, sm: 60, md: 64 },
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                        },
                        '&.Mui-focused': {
                          backgroundColor: theme.palette.background.paper,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        fontWeight: 500
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined 
                            sx={{ 
                              fontSize: { xs: '1.25rem', sm: '1.375rem' },
                              color: theme.palette.primary.main
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                            sx={{ 
                              padding: 1,
                              '& .MuiSvgIcon-root': {
                                fontSize: { xs: '1.25rem', sm: '1.375rem' }
                              },
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? null : <LoginIcon />}
                    sx={{
                      py: { xs: 1.5, sm: 1.75, md: 2 },
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      minHeight: { xs: 56, sm: 60, md: 64 },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `
                        0 8px 32px ${alpha(theme.palette.primary.main, 0.3)},
                        0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}
                      `,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `
                          0 12px 40px ${alpha(theme.palette.primary.main, 0.4)},
                          0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}
                        `,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.action.disabled, 0.12),
                        color: alpha(theme.palette.action.disabled, 0.38),
                        boxShadow: 'none',
                        transform: 'none',
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress 
                          size={24} 
                          color="inherit" 
                          sx={{ color: 'white' }}
                        />
                        <span>Đang đăng nhập...</span>
                      </Box>
                    ) : (
                      'Đăng nhập hệ thống'
                    )}
                  </Button>
                </Stack>
              </Box>

              {/* Access Information */}
              <Box sx={{ 
                mt: 4,
                p: 3,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`
                }
              }}>
                <Stack spacing={1.5} alignItems="center">
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}>
                    <Security sx={{ 
                      fontSize: 20, 
                      color: theme.palette.info.main 
                    }} />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{
                      color: theme.palette.info.main,
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    Quyền truy cập hệ thống
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.875rem', sm: '0.95rem' },
                      lineHeight: 1.6,
                      maxWidth: 280
                    }}
                  >
                    Chỉ tài khoản có quyền <strong>Admin</strong> mới có thể truy cập hệ thống quản trị.
                    Liên hệ quản trị viên nếu bạn cần quyền truy cập.
                  </Typography>
                </Stack>
              </Box>
            </CardContent>

            {/* Footer */}
            <Box sx={{ 
              textAlign: 'center', 
              p: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: alpha(theme.palette.background.default, 0.5)
            }}>
              <Stack spacing={1} alignItems="center">
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500,
                    opacity: 0.8
                  }}
                >
                  © 2024 China App Admin System
                </Typography>
                
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  opacity: 0.6
                }}>
                  <Palette sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Powered by React Admin & Material-UI
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
};

export default LoginPage;