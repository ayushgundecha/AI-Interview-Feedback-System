import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  HowToReg as SignupIcon,
  Info as AboutIcon,
  ContactSupport as ContactIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const menuItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'About', icon: <AboutIcon />, path: '/about' },
    ...(isAuthenticated ? [{ label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }] : []),
  ];

  const authItems = isAuthenticated
    ? [
        {
          label: 'Logout',
          icon: <LogoutIcon />,
          onClick: () => {
            logout();
            router.push('/');
          },
        },
      ]
    : [
        { label: 'Login', icon: <LoginIcon />, path: '/login' },
        { label: 'Sign Up', icon: <PersonAddIcon />, path: '/signup' },
      ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleAuthAction = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else {
      handleNavigation(item.path);
    }
  };

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {menuItems.map((item) => (
        <Button
          key={item.label}
          color="inherit"
          startIcon={item.icon}
          onClick={() => handleNavigation(item.path)}
        >
          {item.label}
        </Button>
      ))}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        {authItems.map((item) => (
          <Button
            key={item.label}
            color="inherit"
            variant="outlined"
            startIcon={item.icon}
            onClick={() => handleAuthAction(item)}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            {authItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => handleAuthAction(item)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => handleNavigation('/')}
        >
          AI Interview Feedback
        </Typography>
        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 