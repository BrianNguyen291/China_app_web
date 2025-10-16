import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import UserProfile from '../components/UserProfile';
import type { SimpleUser } from '../utils/simpleAuth';

interface UserProfilePageProps {
  user: SimpleUser;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user }) => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      pt: 3
    }}>
      {/* Header */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            👤 Thông tin người dùng
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Xem thông tin chi tiết và streak của người dùng
          </Typography>
        </Box>

        {/* User Profile Component */}
        <UserProfile user={user} />
      </Container>
    </Box>
  );
};

export default UserProfilePage;
