import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as ClientsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Category as InventoryIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Pedidos', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Produtos', icon: <ProductsIcon />, path: '/products' },
  { text: 'Estoque', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Clientes', icon: <ClientsIcon />, path: '/clients' },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          background: 'linear-gradient(to bottom, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0))'
        }}
      >
        <Typography variant="subtitle1" component="div" sx={{ 
          fontWeight: 600,
          color: 'primary.dark',
          letterSpacing: '-0.3px',
          fontSize: '0.9rem',
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          Copiadora Pernambuco
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => handleNavigation(item.path)}
                selected={isSelected}
                sx={{
                  mb: 0.3,
                  borderRadius: 2,
                  py: 0.8,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 36
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '0.9rem',
                    color: isSelected ? 'primary.main' : 'text.primary',
                  }}
                />
                {isSelected && (
                  <Box
                    sx={{
                      width: 3,
                      height: 16,
                      borderRadius: 3,
                      backgroundColor: 'primary.main',
                      ml: 1
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
    </div>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          backgroundImage: 'linear-gradient(to right, #1976d2, #1565c0)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              borderRadius: 1.5
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  letterSpacing: '-0.3px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  textAlign: 'center'
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>
                  Sistema de Gestão - 
                </Box>
                Copiadora Pernambuco
              </Typography>
            </Box>
            
            {/* Botão de logout */}
            <Box sx={{ position: 'absolute', right: 16 }}>
              <Tooltip title="Sair do sistema">
                <IconButton 
                  color="inherit" 
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userEmail');
                    navigate('/login');
                  }}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: 'none',
              background: '#ffffff',
              overflowY: 'auto',
              marginTop: '64px',
              height: 'calc(100vh - 64px)',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          marginTop: '64px',
          marginLeft: { xs: 0, sm: `${drawerWidth}px` },
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            minHeight: 'calc(100vh - 120px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            width: '100%',
          }}
        >
          {children}
        </Paper>
      </Box>
    </>
  );
};

export default Layout;
