import React, { useState } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Person as UsersIcon,
  List as WordListsIcon,
  Translate as WordsIcon,
  School as LessonsIcon,
  Quiz as QuestionsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useMediaQuery, useTheme, IconButton, Drawer, List } from '@mui/material';

const MobileMenu: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { name: 'users', label: '👥 Người dùng', icon: UsersIcon },
    { name: 'wordlists', label: '📚 Danh sách từ', icon: WordListsIcon },
    { name: 'words', label: '🈶 Từ vựng', icon: WordsIcon },
    { name: 'lessons', label: '📖 Bài học', icon: LessonsIcon },
    { name: 'questions', label: '❓ Câu hỏi', icon: QuestionsIcon },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (resource: string) => {
    navigate(`/${resource}`);
    setMobileOpen(false);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          ml: { xs: 0.5, sm: 1 },
          p: { xs: 0.5, sm: 1 },
          minWidth: { xs: 32, sm: 40, md: 44 },
          minHeight: { xs: 32, sm: 40, md: 44 }
        }}
      >
        {mobileOpen ? <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} /> : <MenuIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
      </IconButton>
      
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: '85vw', sm: '300px' },
            maxWidth: { xs: '320px', sm: '300px' },
            pt: { xs: 6, sm: 7, md: 8 }, // Account for app bar height
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1200,
            overflow: 'auto'
          },
        }}
      >
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(`/${item.name}`);
            
            return (
              <MenuItem
                key={item.name}
                onClick={() => handleMenuItemClick(item.name)}
                selected={isActive}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                  <Icon 
                    color={isActive ? 'inherit' : 'action'} 
                    sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: isActive ? 600 : 400
                  }}
                />
              </MenuItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
};

export default MobileMenu;
