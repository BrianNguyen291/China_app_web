import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  Refresh,
  Security,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { getAllUsersWithRoles, grantAdminRole, revokeAdminRole } from '../utils/authUtils';

// Define type locally to avoid import issues
type UserRoleData = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
};

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRoleData | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 [USER_MANAGER] Loading users...');
      
      const userData = await getAllUsersWithRoles();
      setUsers(userData);
      
      console.log('✅ [USER_MANAGER] Users loaded:', userData.length);
    } catch (err: any) {
      console.error('❌ [USER_MANAGER] Error loading users:', err);
      setError(err.message || 'Không thể tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = (user: UserRoleData) => {
    setSelectedUser(user);
    setConfirmDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      console.log('🔄 [USER_MANAGER] Changing role for user:', selectedUser.email);
      
      const isCurrentlyAdmin = selectedUser.role === 'admin';
      const success = isCurrentlyAdmin 
        ? await revokeAdminRole(selectedUser.id)
        : await grantAdminRole(selectedUser.id);

      if (success) {
        console.log('✅ [USER_MANAGER] Role changed successfully');
        await loadUsers(); // Reload users
        setConfirmDialog(false);
        setSelectedUser(null);
      } else {
        throw new Error('Không thể thay đổi quyền user');
      }
    } catch (err: any) {
      console.error('❌ [USER_MANAGER] Error changing role:', err);
      setError(err.message || 'Không thể thay đổi quyền user');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleChip = (role: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <Chip
          icon={<Cancel />}
          label="Inactive"
          color="error"
          size="small"
        />
      );
    }

    return role === 'admin' ? (
      <Chip
        icon={<AdminPanelSettings />}
        label="Admin"
        color="primary"
        size="small"
      />
    ) : (
      <Chip
        icon={<Person />}
        label="User"
        color="default"
        size="small"
      />
    );
  };

  const getRoleStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin' && u.is_active).length;
    const regularUsers = users.filter(u => u.role === 'user' && u.is_active).length;
    const inactiveUsers = users.filter(u => !u.is_active).length;

    return { totalUsers, adminUsers, regularUsers, inactiveUsers };
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: { xs: '100vh', sm: '200px' },
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box'
      }}>
        <CircularProgress size={{ xs: 32, sm: 40, md: 48 }} />
        <Typography 
          variant="body1" 
          sx={{ 
            ml: { xs: 1, sm: 2, md: 2 },
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
          }}
        >
          Đang tải danh sách users...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'auto',
      boxSizing: 'border-box',
      backgroundColor: '#f5f5f5',
      padding: { xs: 0.5, sm: 1, md: 2 }
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3, md: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Box sx={{
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2, md: 2 }
        }}>
          <Security sx={{ 
            fontSize: { xs: 24, sm: 28, md: 32 }, 
            color: 'primary.main' 
          }} />
          <Typography 
            variant="h5" 
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Quản lý Users & Roles
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadUsers}
          disabled={loading}
          size="small"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' }
          }}
        >
          Làm mới
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        },
        gap: { xs: 1, sm: 2, md: 2 },
        mb: { xs: 2, sm: 3, md: 3 }
      }}>
        <Card sx={{ minWidth: { xs: 120, sm: 150, md: 200 } }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Tổng Users
            </Typography>
            <Typography 
              variant="h4" 
              color="primary"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {stats.totalUsers}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: { xs: 120, sm: 150, md: 200 } }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Admin Users
            </Typography>
            <Typography 
              variant="h4" 
              color="primary"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {stats.adminUsers}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: { xs: 120, sm: 150, md: 200 } }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Regular Users
            </Typography>
            <Typography 
              variant="h4" 
              color="textPrimary"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {stats.regularUsers}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ minWidth: { xs: 120, sm: 150, md: 200 } }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Typography 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' } }}
            >
              Inactive Users
            </Typography>
            <Typography 
              variant="h4" 
              color="error"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {stats.inactiveUsers}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Users Table */}
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              mb: { xs: 2, sm: 2, md: 3 }
            }}
          >
            Danh sách Users
          </Typography>
          
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{
              width: '100%',
              overflow: 'auto',
              maxHeight: { xs: '60vh', sm: '70vh', md: '80vh' }
            }}
          >
            <Table sx={{ minWidth: { xs: 600, sm: 700, md: 800 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                    fontWeight: 600,
                    p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                  }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                    fontWeight: 600,
                    p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                  }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                    fontWeight: 600,
                    p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                  }}>
                    Status
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                      fontWeight: 600,
                      p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ 
                      p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' }
                    }}>
                      <Box sx={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 0.5, sm: 1, md: 1 }
                      }}>
                        {user.role === 'admin' ? (
                          <AdminPanelSettings 
                            color="primary" 
                            sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
                          />
                        ) : (
                          <Person 
                            color="action" 
                            sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
                          />
                        )}
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell sx={{ 
                      p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                    }}>
                      {getRoleChip(user.role, user.is_active)}
                    </TableCell>
                    
                    <TableCell sx={{ 
                      p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                    }}>
                      <Chip
                        icon={user.is_active ? <CheckCircle /> : <Cancel />}
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                        sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' } }}
                      />
                    </TableCell>
                    
                    <TableCell align="center" sx={{ 
                      p: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                    }}>
                      <Tooltip 
                        title={user.role === 'admin' ? 'Thu hồi quyền Admin' : 'Cấp quyền Admin'}
                      >
                        <IconButton
                          onClick={() => handleRoleChange(user)}
                          disabled={!user.is_active}
                          color={user.role === 'admin' ? 'error' : 'primary'}
                          size="small"
                        >
                          {user.role === 'admin' ? (
                            <AdminPanelSettings />
                          ) : (
                            <Security />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          Xác nhận thay đổi quyền
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn {selectedUser?.role === 'admin' ? 'thu hồi' : 'cấp'} quyền Admin cho user{' '}
            <strong>{selectedUser?.email}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Thao tác này sẽ thay đổi quyền truy cập của user vào hệ thống admin.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            onClick={confirmRoleChange}
            color={selectedUser?.role === 'admin' ? 'error' : 'primary'}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : null}
          >
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleManager;
