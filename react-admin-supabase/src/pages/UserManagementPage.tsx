import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import UserList from '../components/UserList';

const UserManagementPage: React.FC = () => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      pt: 3
    }}>
      <Container maxWidth="xl">
        <UserList />
      </Container>
    </Box>
  );
};

export default UserManagementPage;

