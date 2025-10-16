import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Stack,
  Fade,
  Slide,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  Security,
  AdminPanelSettings,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { checkJWTSession } from '../utils/jwtAuthManager';
import { jwtLogoutWithStore } from '../utils/jwtAuthManager';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        console.log('🔒 [PROTECTED_ROUTE] Checking JWT session...');
        
        // Debug store state trước khi check session
        const storeState = useAuthStore.getState();
        console.log('🏪 [PROTECTED_ROUTE] Current store state:', {
          isAuthenticated: storeState.isAuthenticated,
          hasUser: !!storeState.user,
          hasToken: !!storeState.token,
          userEmail: storeState.user?.email,
          userRole: storeState.user?.role,
          loading: storeState.loading,
          error: storeState.error
        });
        
        // Debug localStorage
        const authStorage = localStorage.getItem('auth-storage');
        console.log('📦 [PROTECTED_ROUTE] Raw auth-storage:', authStorage ? 'EXISTS' : 'NOT_FOUND');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            console.log('📦 [PROTECTED_ROUTE] Parsed auth-storage:', parsed);
          } catch (error) {
            console.error('❌ [PROTECTED_ROUTE] Error parsing auth-storage:', error);
          }
        }
        
        console.log('🔄 [PROTECTED_ROUTE] Calling checkJWTSession...');
        const session = await checkJWTSession();
        
        console.log('📋 [PROTECTED_ROUTE] JWT session result:', session);
        console.log('📋 [PROTECTED_ROUTE] Session details:', {
          isAuthenticated: session.isAuthenticated,
          hasUser: !!session.user,
          userEmail: session.user?.email,
          userRole: session.user?.role,
          loading: session.loading,
          error: session.error
        });
        
        if (session.isAuthenticated && session.user) {
          console.log('✅ [PROTECTED_ROUTE] JWT session valid, access granted for:', session.user.email);
          setIsAuthorized(true);
        } else {
          console.warn('⚠️ [PROTECTED_ROUTE] JWT session invalid or user not logged in, redirecting to login');
          console.warn('⚠️ [PROTECTED_ROUTE] Reasons:', {
            isAuthenticated: session.isAuthenticated,
            hasUser: !!session.user,
            error: session.error
          });
          setIsAuthorized(false);
        }
      } catch (err: any) {
        console.error('❌ [PROTECTED_ROUTE] Unexpected error:', err);
        console.error('❌ [PROTECTED_ROUTE] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)
          `,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          overflow: 'auto',
          boxSizing: 'border-box',
          padding: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Slide direction="up" in={true} timeout={800}>
          <Card
            elevation={0}
            sx={{
              maxWidth: { xs: '90%', sm: 400, md: 450 },
              width: '100%',
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
              overflow: 'hidden',
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
            <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 }, textAlign: 'center' }}>
              <Stack spacing={3} alignItems="center">
                <Fade in={true} timeout={1200}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: { xs: 80, sm: 90, md: 100 },
                        height: { xs: 80, sm: 90, md: 100 },
                        bgcolor: 'primary.main',
                        boxShadow: `
                          0 8px 32px ${alpha(theme.palette.primary.main, 0.3)},
                          0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}
                        `,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }}
                    >
                      <Security sx={{ 
                        fontSize: { xs: 40, sm: 45, md: 50 },
                        color: 'white'
                      }} />
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                  </Box>
                </Fade>

                <Stack spacing={2} alignItems="center">
                  <Typography 
                    variant="h4" 
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Xác thực quyền truy cập
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                      opacity: 0.8,
                      fontWeight: 500
                    }}
                  >
                    Đang kiểm tra quyền admin...
                  </Typography>
                </Stack>

                <Box sx={{ position: 'relative', mt: 2 }}>
                  <CircularProgress 
                    size={60}
                    thickness={4}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle 
                      sx={{ 
                        fontSize: 24, 
                        color: theme.palette.primary.main,
                        opacity: 0.6
                      }} 
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Slide>
      </Box>
    );
  }


  if (!isAuthorized) {
    console.log('🚫 [PROTECTED_ROUTE] Redirecting to login - not authorized');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [PROTECTED_ROUTE] Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
