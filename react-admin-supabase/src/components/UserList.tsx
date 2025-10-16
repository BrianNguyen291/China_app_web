import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Close,
  Person,
  EmojiEvents,
  Star,
  Timeline,
  CalendarToday
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import UserCard from './UserCard';

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

interface UserWithStreak {
  user: UserData;
  streakData: StreakData | null;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserWithStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithStreak | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const itemsPerPage = 12;

  console.log('👥 [USER_LIST] Component rendered');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    filterUsers();
  }, [searchTerm, filterTier, filterStatus]);

  const fetchUsers = async () => {
    try {
      console.log('👥 [USER_LIST] Fetching users...');
      setLoading(true);
      setError(null);

      // Fetch all users with role 'user' (not admin)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('❌ [USER_LIST] Error fetching users:', usersError);
        setError(`Lỗi tải danh sách người dùng: ${usersError.message}`);
        setLoading(false);
        return;
      }

      // Fetch streak data for all users
      const userIds = usersData.map(user => user.id);
      const { data: streakData, error: streakError } = await supabase
        .from('user_checkin_streak')
        .select('*')
        .in('user_id', userIds);

      if (streakError && streakError.code !== 'PGRST116') {
        console.error('❌ [USER_LIST] Error fetching streak data:', streakError);
        setError(`Lỗi tải dữ liệu streak: ${streakError.message}`);
        setLoading(false);
        return;
      }

      // Combine user data with streak data
      const usersWithStreak: UserWithStreak[] = usersData.map(user => {
        const userStreakData = streakData?.find(streak => streak.user_id === user.id) || null;
        return {
          user,
          streakData: userStreakData
        };
      });

      setUsers(usersWithStreak);
      console.log('✅ [USER_LIST] Users fetched successfully', { count: usersWithStreak.length });

      setLoading(false);
    } catch (error: any) {
      console.error('❌ [USER_LIST] Error:', error);
      setError(`Lỗi không xác định: ${error.message}`);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filteredUsers = [...users];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(userWithStreak => 
        userWithStreak.user.email.toLowerCase().includes(searchLower) ||
        (userWithStreak.user.display_name && userWithStreak.user.display_name.toLowerCase().includes(searchLower))
      );
    }

    // Subscription tier filter
    if (filterTier !== 'all') {
      filteredUsers = filteredUsers.filter(userWithStreak => 
        userWithStreak.user.subscription_tier === filterTier
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filteredUsers = filteredUsers.filter(userWithStreak => 
        filterStatus === 'active' ? userWithStreak.user.is_active : !userWithStreak.user.is_active
      );
    }

    // Calculate pagination
    const totalFiltered = filteredUsers.length;
    const newTotalPages = Math.ceil(totalFiltered / itemsPerPage);
    setTotalPages(newTotalPages);

    // Reset to page 1 if current page is beyond total pages
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  };

  const getFilteredUsers = () => {
    let filteredUsers = [...users];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(userWithStreak => 
        userWithStreak.user.email.toLowerCase().includes(searchLower) ||
        (userWithStreak.user.display_name && userWithStreak.user.display_name.toLowerCase().includes(searchLower))
      );
    }

    // Subscription tier filter
    if (filterTier !== 'all') {
      filteredUsers = filteredUsers.filter(userWithStreak => 
        userWithStreak.user.subscription_tier === filterTier
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filteredUsers = filteredUsers.filter(userWithStreak => 
        filterStatus === 'active' ? userWithStreak.user.is_active : !userWithStreak.user.is_active
      );
    }

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredUsers.slice(startIndex, endIndex);
  };

  const handleViewDetails = (user: UserData, streakData: StreakData | null) => {
    setSelectedUser({ user, streakData });
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedUser(null);
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
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        py: { xs: 4, sm: 6, md: 8 },
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={{ xs: 40, sm: 50, md: 60 }} 
            sx={{ mb: 2 }} 
          />
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Đang tải danh sách người dùng...
          </Typography>
        </Box>
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
          mb: 3,
          width: '100%'
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Lỗi tải dữ liệu
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

  const filteredUsers = getFilteredUsers();
  const totalFiltered = users.filter(userWithStreak => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!userWithStreak.user.email.toLowerCase().includes(searchLower) &&
          !(userWithStreak.user.display_name && userWithStreak.user.display_name.toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    if (filterTier !== 'all' && userWithStreak.user.subscription_tier !== filterTier) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !userWithStreak.user.is_active) return false;
      if (filterStatus === 'inactive' && userWithStreak.user.is_active) return false;
    }
    return true;
  }).length;

  return (
    <Box sx={{
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 3 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          👥 Quản lý người dùng
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Tổng cộng {totalFiltered} người dùng
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 2 }, 
        mb: { xs: 2, sm: 3 }, 
        flexWrap: 'wrap',
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <TextField
          placeholder="Tìm kiếm theo email hoặc tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: { xs: '100%', sm: 300 },
            width: { xs: '100%', sm: 'auto' }
          }}
          size="small"
        />

        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 150 },
          width: { xs: '100%', sm: 'auto' }
        }} size="small">
          <InputLabel>Gói dịch vụ</InputLabel>
          <Select
            value={filterTier}
            label="Gói dịch vụ"
            onChange={(e) => setFilterTier(e.target.value)}
            startAdornment={<FilterList />}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="free">Miễn phí</MenuItem>
            <MenuItem value="pro">Pro</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 150 },
          width: { xs: '100%', sm: 'auto' }
        }} size="small">
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Bị khóa</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Không tìm thấy người dùng
          </Typography>
          <Typography 
            variant="body2"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
          >
            Không có người dùng nào phù hợp với bộ lọc hiện tại.
          </Typography>
        </Alert>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {filteredUsers.map((userWithStreak) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={userWithStreak.user.id}>
                <UserCard
                  user={userWithStreak.user}
                  streakData={userWithStreak.streakData}
                  onViewDetails={handleViewDetails}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 3, sm: 4, md: 4 },
              width: '100%'
            }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
                size={{ xs: "small", sm: "medium", md: "large" }}
              />
            </Box>
          )}
        </>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">
            Chi tiết người dùng
          </Typography>
          <IconButton onClick={handleCloseDetails}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedUser && (
            <Box>
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={selectedUser.user.profile_image_url || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mr: 3,
                    border: '3px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  {selectedUser.user.display_name?.charAt(0)?.toUpperCase() || 
                   selectedUser.user.email.charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {selectedUser.user.display_name || 'Người dùng'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {selectedUser.user.email}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    <Chip
                      icon={<Star />}
                      label={selectedUser.user.subscription_tier === 'pro' ? 'Pro' : 'Miễn phí'}
                      color={selectedUser.user.subscription_tier === 'pro' ? 'success' : 'default'}
                      variant="outlined"
                    />
                    <Chip
                      icon={<Timeline />}
                      label={`Level ${selectedUser.user.level}`}
                      color="info"
                      variant="outlined"
                    />
                    <Chip
                      label={selectedUser.user.is_active ? 'Hoạt động' : 'Bị khóa'}
                      color={selectedUser.user.is_active ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Streak Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEvents sx={{ mr: 1 }} />
                  Thông tin Streak
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Typography variant="h3" color="primary.main">
                        {selectedUser.streakData?.current_streak || 0}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Streak hiện tại
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Typography 
                        variant="h3" 
                        sx={{ color: getStreakLevel(selectedUser.streakData?.longest_streak || 0).color }}
                      >
                        {selectedUser.streakData?.longest_streak || 0}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Streak dài nhất
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getStreakLevel(selectedUser.streakData?.longest_streak || 0).level}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Additional Info */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo tài khoản
                    </Typography>
                    <Typography variant="h6">
                      {formatDate(selectedUser.user.created_at)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Lần đăng nhập cuối
                    </Typography>
                    <Typography variant="h6">
                      {formatDate(selectedUser.user.last_login_at)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {!selectedUser.streakData && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Người dùng này chưa có dữ liệu streak.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;
