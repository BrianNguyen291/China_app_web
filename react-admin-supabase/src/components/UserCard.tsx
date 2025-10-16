import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Person,
  EmojiEvents,
  Star,
  Timeline,
  CalendarToday,
  Visibility,
  Close
} from '@mui/icons-material';

interface UserData {
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

interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  updated_at: string;
}

interface UserCardProps {
  user: UserData;
  streakData: StreakData | null;
  onViewDetails: (user: UserData, streakData: StreakData | null) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, streakData, onViewDetails }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const streakLevel = getStreakLevel(streakData?.longest_streak || 0);

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        width: '100%'
      }}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        p: { xs: 1.5, sm: 2, md: 2 },
        '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2 } }
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 1.5, sm: 2, md: 2 }
        }}>
          <Avatar
            src={user.profile_image_url || undefined}
            sx={{
              width: { xs: 40, sm: 45, md: 50 },
              height: { xs: 40, sm: 45, md: 50 },
              bgcolor: 'primary.main',
              mr: { xs: 1.5, sm: 2, md: 2 },
              border: '2px solid',
              borderColor: 'primary.light',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
            }}
          >
            {user.display_name?.charAt(0)?.toUpperCase() || 
             user.email.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              {user.display_name || 'Người dùng'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' }
              }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>

        {/* Status Chips */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1, md: 1 }, 
          mb: { xs: 1.5, sm: 2, md: 2 }, 
          flexWrap: 'wrap' 
        }}>
          <Chip
            icon={<Star />}
            label={getSubscriptionTierLabel(user.subscription_tier)}
            color={getSubscriptionTierColor(user.subscription_tier) as any}
            size="small"
            variant="outlined"
            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
          />
          <Chip
            icon={<Timeline />}
            label={`Level ${user.level}`}
            color="info"
            size="small"
            variant="outlined"
            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
          />
          <Chip
            label={user.is_active ? 'Hoạt động' : 'Bị khóa'}
            color={user.is_active ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
          />
        </Box>

        {/* Streak Information */}
        <Box sx={{ mb: { xs: 1.5, sm: 2, md: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Streak hiện tại
            </Typography>
            <Typography 
              variant="h6" 
              color="primary.main"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
            >
              {streakData?.current_streak || 0}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Streak dài nhất
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: streakLevel.color,
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
              }}
            >
              {streakData?.longest_streak || 0}
            </Typography>
          </Box>

          {streakData && streakData.longest_streak > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {streakLevel.level}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((streakData.longest_streak / 30) * 100, 100)}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: streakLevel.color,
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          )}

          {!streakData && (
            <Typography variant="caption" color="text.secondary">
              Chưa có dữ liệu streak
            </Typography>
          )}
        </Box>

        {/* Quick Info */}
        <Box sx={{ mb: { xs: 1.5, sm: 2, md: 2 } }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
          >
            Tạo: {formatDate(user.created_at)}
          </Typography>
          <br />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
          >
            Đăng nhập cuối: {formatDate(user.last_login_at)}
          </Typography>
        </Box>

        {/* Action Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => onViewDetails(user, streakData)}
          sx={{ 
            mt: 'auto',
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
            py: { xs: 0.5, sm: 1, md: 1 }
          }}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserCard;
