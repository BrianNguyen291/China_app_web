import { AppBar, TitlePortal, UserMenu } from 'react-admin';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import MobileMenu from './MobileMenu';

const CustomAppBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        width: '100%',
        boxSizing: 'border-box',
        '& .RaAppBar-title': {
          flex: 1,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
          fontWeight: { xs: 500, sm: 600, md: 600 }
        },
        '& .RaUserMenu-button': {
          minWidth: { xs: 'auto', sm: 'auto', md: 'auto' }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: { xs: 0.5, sm: 1, md: 2 },
          padding: { xs: '0 4px', sm: '0 8px', md: '0 16px' },
          minHeight: { xs: 48, sm: 56, md: 64 },
          boxSizing: 'border-box'
        }}
      >
        {isMobile && <MobileMenu />}
        <TitlePortal />
        <Box sx={{ flexGrow: 1 }} />
        <UserMenu />
      </Box>
    </AppBar>
  );
};

export default CustomAppBar;
