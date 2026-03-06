import React, { useState, useEffect } from 'react';
import { 
    Grid, Paper, Typography, Box, Card, CardContent, 
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider,
    CircularProgress
} from '@mui/material';
import { 
    AccountBalanceWallet, 
    EventAvailable, 
    Payments, 
    TrendingUp,
    History
} from '@mui/icons-material';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import axios from 'axios';

const mockChartData = [
    { name: 'Lun', produccion: 400 },
    { name: 'Mar', produccion: 300 },
    { name: 'Mie', produccion: 600 },
    { name: 'Jue', produccion: 800 },
    { name: 'Vie', produccion: 500 },
    { name: 'Sab', produccion: 900 },
    { name: 'Dom', produccion: 700 },
];

const Dashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/dashboard/stats');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    const stats = [
        { title: 'Caja Actual', value: `S/ ${data?.stats.caja.toFixed(2)}`, icon: <AccountBalanceWallet />, color: '#4caf50' },
        { title: 'Asistencia Hoy', value: data?.stats.asistencia, icon: <EventAvailable />, color: '#2196f3' },
        { title: 'Pagos Pendientes', value: data?.stats.pagos, icon: <Payments />, color: '#f44336' },
        { title: 'Producción Diaria', value: `${data?.stats.produccion} und`, icon: <TrendingUp />, color: '#ff9800' },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Dashboard General</Typography>
            
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: stat.color, mr: 2, width: 56, height: 56 }}>
                                    {stat.icon}
                                </Avatar>
                                <Box>
                                    <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600 }}>
                                        {stat.title}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Rendimiento de Producción (Semanal)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="produccion" fill="#D32F2F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400, overflow: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <History sx={{ mr: 1 }} /> Actividad Reciente
                        </Typography>
                        <List>
                            {data?.actividad.map((item: any, index: number) => (
                                <React.Fragment key={index}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: item.accion === 'LOGIN' ? 'info.main' : 'success.main' }}>
                                                {item.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.accion}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        {item.username}
                                                    </Typography>
                                                    {` — ${item.detalles}`}
                                                    <Typography variant="caption" display="block" color="textSecondary">
                                                        {new Date(item.fecha).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < data.actividad.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
