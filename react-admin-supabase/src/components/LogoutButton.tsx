import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { performLogout, forceLogout } from '../utils/logout';
import { simpleLogout, emergencyLogout } from '../utils/simpleLogout';

interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  sx?: any;
  children?: React.ReactNode;
  forceLogout?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  sx,
  children,
  forceLogout: useForceLogout = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    console.log('🚪 [LOGOUT_BUTTON] Logout button clicked');
    
    if (useForceLogout) {
      // Sử dụng emergency logout cho force logout
      emergencyLogout();
    } else {
      // Sử dụng simple logout
      simpleLogout();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleLogout}
      disabled={loading}
      sx={{
        textTransform: 'none',
        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
        padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' },
        minHeight: { xs: 32, sm: 36, md: 40 },
        width: fullWidth ? '100%' : 'auto',
        boxSizing: 'border-box',
        '&:disabled': {
          opacity: 0.6
        },
        ...sx
      }}
    >
      {loading ? (
        <CircularProgress 
          size={16} 
          sx={{ 
            mr: 1,
            color: 'inherit'
          }} 
        />
      ) : null}
      {children || '🚪 Đăng xuất'}
    </Button>
  );
};

export default LogoutButton;
