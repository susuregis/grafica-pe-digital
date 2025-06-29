import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { clientService } from '../services/api';
import FormDialog, { ConfirmationDialog } from '../components/FormDialog';

// Componente de formulário para clientes
const ClientForm = ({ formData, setFormData, isEdit }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome do Cliente"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="email"
          label="Email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Telefone"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="CNPJ/CPF"
          value={formData.document || ''}
          onChange={(e) => setFormData({ ...formData, document: e.target.value })}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Endereço"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </Grid>
    </Grid>
  );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para formulário e dialogs
  const [openClientForm, setOpenClientForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: ''
  });
  
  // Paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
    // Carregar clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Tentando buscar clientes...');
      const response = await clientService.getAll();
      console.log('Resposta da API:', response);
      setClients(response.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      console.error('Detalhes do erro:', err.response || err.message);
      setError('Não foi possível carregar os clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para carregar clientes na inicialização
  useEffect(() => {
    fetchClients();
  }, []);
  
  // Lidar com criação/edição de cliente
  const handleSubmitClient = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedClient) {
        await clientService.update(selectedClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      
      setOpenClientForm(false);
      setSelectedClient(null);
      setIsEditMode(false);
      fetchClients();
      
      // Resetar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: ''
      });
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Não foi possível salvar o cliente. Tente novamente mais tarde.');
    }
  };
  
  // Lidar com exclusão de cliente
  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      await clientService.delete(selectedClient.id);
      setOpenDeleteDialog(false);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      setError('Não foi possível excluir o cliente. Tente novamente mais tarde.');
    }
  };
  
  // Abrir formulário para editar cliente
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      document: client.document || '',
      address: client.address || ''
    });
    setIsEditMode(true);
    setOpenClientForm(true);
  };
  
  // Abrir formulário para criar cliente
  const handleOpenCreateForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: ''
    });
    setIsEditMode(false);
    setOpenClientForm(true);
  };
  
  // Filtrar clientes pelo termo de busca
  const filteredClients = clients.filter(client => {
    return (
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.document && client.document.includes(searchTerm))
    );
  });
  
  // Controles de paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Clientes
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar clientes por nome, email ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
          >
            Novo Cliente
          </Button>
        </Grid>
      </Grid>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>CNPJ/CPF</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <TableRow hover key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone || "-"}</TableCell>
                        <TableCell>{client.document || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditClient(client)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedClient(client);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                  {filteredClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredClients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </Paper>
      
      {/* Diálogo de criação/edição de cliente */}
      <FormDialog
        open={openClientForm}
        handleClose={() => {
          setOpenClientForm(false);
          setIsEditMode(false);
          setSelectedClient(null);
        }}
        title={isEditMode ? "Editar Cliente" : "Novo Cliente"}
        onSubmit={handleSubmitClient}
      >
        <ClientForm 
          formData={formData}
          setFormData={setFormData}
          isEdit={isEditMode}
        />
      </FormDialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <ConfirmationDialog
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteClient}
        confirmButtonText="Excluir"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default Clients;
