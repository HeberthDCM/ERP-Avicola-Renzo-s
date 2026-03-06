import React, { useState, useEffect } from 'react';
import { 
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, 
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
    Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard,
    AccountBalanceWallet,
    Inventory,
    EventAvailable,
    Payments,
    People,
    Logout,
    Brightness4,
    Brightness7,
    AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { useAppTheme } from '../context/ThemeContext.tsx';

const drawerWidth = 260;

const iconMap: { [key: string]: React.ReactNode } = {
    Dashboard: <Dashboard />,
    AccountBalanceWallet: <AccountBalanceWallet />,
    Inventory: <Inventory />,
    EventAvailable: <EventAvailable />,
    Payments: <Payments />,
    People: <People />,
};

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);
    const [modules, setModules] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const { toggleColorMode, mode } = useAppTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await axios.get('/api/modules');
                setModules(response.data);
            } catch (error) {
                console.error('Error fetching modules', error);
            }
        };
        fetchModules();
    }, []);

    const handleDrawerToggle = () => setOpen(!open);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ 
                zIndex: theme.zIndex.drawer + 1,
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.background.paper,
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        AVÍCOLA RENZO'S
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Cambiar tema">
                            <IconButton onClick={toggleColorMode} color="inherit">
                                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Mi Perfil">
                            <IconButton onClick={handleMenuOpen} color="inherit">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
                                    {user?.nombre.charAt(0)}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2">{user?.nombre}</Typography>
                            </MenuItem>
                            <MenuItem disabled>
                                <Typography variant="caption" color="textSecondary">{user?.rol}</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleMenuClose}>
                                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                                Perfil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                                Cerrar Sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "persistent"}
                open={open}
                onClose={isMobile ? handleDrawerToggle : undefined}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: drawerWidth, 
                        boxSizing: 'border-box',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.default
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {modules.map((module) => (
                            <ListItem key={module.id} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    onClick={() => navigate(module.ruta)}
                                    selected={location.pathname === module.ruta}
                                    sx={{
                                        minHeight: 48,
                                        px: 2.5,
                                        mx: 1,
                                        borderRadius: 2,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white',
                                            '& .MuiListItemIcon-root': { color: 'white' },
                                            '&:hover': { backgroundColor: theme.palette.primary.dark }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                                        {iconMap[module.icono] || <Dashboard />}
                                    </ListItemIcon>
                                    <ListItemText primary={module.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                ...(open && !isMobile && {
                    marginLeft: 0,
                }),
                ...(!open && !isMobile && {
                    marginLeft: `-${drawerWidth}px`,
                })
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
