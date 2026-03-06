import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, MenuItem, Chip, IconButton, Alert,
    TablePagination, InputAdornment
} from '@mui/material';
import { Add, Search, FilterList, AccountBalanceWallet } from '@mui/icons-material';
import axios from 'axios';

const Caja: React.FC = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ tipo: 'INGRESO', monto: '', descripcion: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRecords = async () => {
        try {
            const response = await axios.get('/api/caja');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching caja records', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ tipo: 'INGRESO', monto: '', descripcion: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/caja', formData);
            handleClose();
            fetchRecords();
        } catch (error) {
            console.error('Error saving record', error);
        }
    };

    const filteredRecords = records.filter(r => 
        r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceWallet sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>Control de Caja</Typography>
                        <Typography variant="body2" color="textSecondary">Gestión de ingresos y egresos de efectivo</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpen} size="large">
                    Nuevo Registro
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        placeholder="Buscar por descripción..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button startIcon={<FilterList />}>Filtros</Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRecords
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{new Date(row.fecha).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.tipo} 
                                            color={row.tipo === 'INGRESO' ? 'success' : 'error'} 
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{row.descripcion}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: row.tipo === 'INGRESO' ? 'success.main' : 'error.main' }}>
                                        {row.tipo === 'INGRESO' ? '+' : '-'} S/ {row.monto.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredRecords.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No se encontraron registros</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRecords.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Movimiento de Caja</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Movimiento"
                            margin="normal"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            required
                        >
                            <MenuItem value="INGRESO">Ingreso (+)</MenuItem>
                            <MenuItem value="EGRESO">Egreso (-)</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Monto (S/)"
                            type="number"
                            margin="normal"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            required
                            inputProps={{ step: "0.01", min: "0.01" }}
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            margin="normal"
                            multiline
                            rows={3}
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            required
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" variant="contained" color="primary">Guardar Registro</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Caja;
