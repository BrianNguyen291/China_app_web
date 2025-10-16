import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Person,
  EmojiEvents,
  TrendingUp,
  CalendarToday,
  Star,
  Timeline
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import type { SimpleUser } from '../utils/simpleAuth';

interface UserProfileProps {
  user: SimpleUser;
}

interface UserStreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  updated_at: string;
}

interface UserProfileData {
  id: string;
  email: string;
  display_name: string | null;
  profile_image_url: string | null;
  subscription_tier: string;
  created_at: string;
  last_login_at: string | null;
  level: number;
  role: string;
  is_active: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [streakData, setStreakData] = useState<UserStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('👤 [USER_PROFILE] Component rendered', { userId: user?.id });

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      console.log('👤 [USER_PROFILE] Fetching user profile...');
      setLoading(true);
      setError(null);

      // Fetch user profile and streak data in parallel
      const [profileResult, streakResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_checkin_streak')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (profileResult.error) {
        console.error('❌ [USER_PROFILE] Error fetching profile:', profileResult.error);
        setError(`Lỗi tải thông tin người dùng: ${profileResult.error.message}`);
        setLoading(false);
        return;
      }

      if (streakResult.error && streakResult.error.code !== 'PGRST116') {
        console.error('❌ [USER_PROFILE] Error fetching streak:', streakResult.error);
        setError(`Lỗi tải thông tin streak: ${streakResult.error.message}`);
        setLoading(false);
        return;
      }

      setUserProfile(profileResult.data);
      setStreakData(streakResult.data || null);

      console.log('✅ [USER_PROFILE] Data fetched successfully', {
        profile: profileResult.data,
        streak: streakResult.data
      });

      setLoading(false);
    } catch (error: any) {
      console.error('❌ [USER_PROFILE] Error:', error);
      setError(`Lỗi không xác định: ${error.message}`);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'success';
      case 'free':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSubscriptionTierLabel = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'Pro';
      case 'free':
        return 'Miễn phí';
      default:
        return tier;
    }
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: '🔥 Master', color: '#ff6b35' };
    if (streak >= 14) return { level: '⭐ Expert', color: '#ffd700' };
    if (streak >= 7) return { level: '🚀 Advanced', color: '#4caf50' };
    if (streak >= 3) return { level: '📈 Intermediate', color: '#2196f3' };
    return { level: '🌱 Beginner', color: '#9e9e9e' };
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Card sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 800 }, 
          mx: 'auto',
          width: '100%'
        }}>
          <CardContent sx={{ 
            textAlign: 'center', 
            py: { xs: 3, sm: 4, md: 4 },
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            <CircularProgress size={{ xs: 32, sm: 40, md: 48 }} sx={{ mb: 2 }} />
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
            >
              Đang tải thông tin người dùng...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Alert severity="error" sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 800 }, 
          mx: 'auto',
          width: '100%'
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Lỗi tải thông tin
          </Typography>
          <Typography 
            variant="body2"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
          >
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Alert severity="warning" sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 800 }, 
          mx: 'auto',
          width: '100%'
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Không tìm thấy thông tin người dùng
          </Typography>
          <Typography 
            variant="body2"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
          >
            Không thể tải thông tin profile cho người dùng này.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const streakLevel = getStreakLevel(streakData?.longest_streak || 0);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <Card sx={{ 
        maxWidth: { xs: '100%', sm: 600, md: 800 }, 
        mx: 'auto', 
        boxShadow: 3,
        width: '100%'
      }}>
        <CardContent sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }
        }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Avatar
              src={userProfile.profile_image_url || undefined}
              sx={{
                width: { xs: 60, sm: 70, md: 80 },
                height: { xs: 60, sm: 70, md: 80 },
                bgcolor: 'primary.main',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                mr: { xs: 0, sm: 3 },
                mb: { xs: 2, sm: 0 },
                border: '3px solid',
                borderColor: 'primary.light'
              }}
            >
              {userProfile.display_name?.charAt(0)?.toUpperCase() || 
               userProfile.email.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                {userProfile.display_name || 'Người dùng'}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                {userProfile.email}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap', 
                mt: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Chip
                  icon={<Person />}
                  label={userProfile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  color={userProfile.role === 'admin' ? 'secondary' : 'primary'}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Star />}
                  label={getSubscriptionTierLabel(userProfile.subscription_tier)}
                  color={getSubscriptionTierColor(userProfile.subscription_tier) as any}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Timeline />}
                  label={`Level ${userProfile.level}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Streak Information */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <EmojiEvents sx={{ mr: 1, color: streakLevel.color }} />
              Thông tin Streak
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Current Streak */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ 
                  p: { xs: 1.5, sm: 2, md: 2 }, 
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <Typography 
                    variant="h3" 
                    color="primary.main" 
                    gutterBottom
                    sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
                  >
                    {streakData?.current_streak || 0}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}
                  >
                    Streak hiện tại
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                  >
                    {streakData?.last_checkin_date 
                      ? `Lần cuối: ${new Date(streakData.last_checkin_date).toLocaleDateString('vi-VN')}`
                      : 'Chưa check-in'
                    }
                  </Typography>
                </Card>
              </Grid>

              {/* Longest Streak */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ 
                  p: { xs: 1.5, sm: 2, md: 2 }, 
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: streakLevel.color,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                    }}
                    gutterBottom
                  >
                    {streakData?.longest_streak || 0}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}
                  >
                    Streak dài nhất
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                  >
                    {streakLevel.level}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Streak Progress */}
            {streakData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tiến độ streak dài nhất: {streakData.longest_streak} ngày
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((streakData.longest_streak / 30) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: streakLevel.color,
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Mục tiêu: 30 ngày (Master Level)
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* User Details */}
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 1 }} />
              Thông tin chi tiết
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo tài khoản
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(userProfile.created_at)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lần đăng nhập cuối
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(userProfile.last_login_at)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái tài khoản
                  </Typography>
                  <Typography variant="h6" color={userProfile.is_active ? 'success.main' : 'error.main'}>
                    {userProfile.is_active ? 'Hoạt động' : 'Bị khóa'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật cuối
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(streakData?.updated_at)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* No Streak Data Message */}
          {!streakData && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Người dùng này chưa có dữ liệu streak. Họ chưa thực hiện check-in nào.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
