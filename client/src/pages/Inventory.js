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
  CircularProgress,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddStockIcon,
  RemoveCircleOutline as RemoveStockIcon
} from '@mui/icons-material';
import { materialService } from '../services/api';
import FormDialog, { ConfirmationDialog } from '../components/FormDialog';

// Componente de formulário para materiais
const MaterialForm = ({ formData, setFormData, isEdit }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome do Material"
          value={formData.nome || ''}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          select
          label="Categoria"
          value={formData.categoria || ''}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          required
        >
          <MenuItem value="papel">Papel</MenuItem>
          <MenuItem value="tinta">Tinta</MenuItem>
          <MenuItem value="tecido">Tecido</MenuItem>
          <MenuItem value="lona">Lona</MenuItem>
          <MenuItem value="vinil">Vinil</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </TextField>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Estoque"
          value={formData.estoque || ''}
          onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Unidade de Medida"
          value={formData.unidade || ''}
          onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
          placeholder="Ex: Folhas, Metros, Litros"
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Fornecedor"
          value={formData.fornecedor || ''}
          onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descrição"
          value={formData.descricao || ''}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </Grid>
    </Grid>
  );
};

// Componente de formulário para ajuste de estoque
const StockAdjustForm = ({ formData, setFormData, operacao }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Material: <strong>{formData.nome}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Estoque atual: {formData.estoque} {formData.unidade}
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="number"
          label={operacao === 'adicionar' ? 'Quantidade a Adicionar' : 'Quantidade a Remover'}
          value={formData.quantidade || ''}
          onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 1 }}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Motivo"
          value={formData.motivo || ''}
          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          placeholder={operacao === 'adicionar' ? "Ex: Compra, Devolução" : "Ex: Consumo, Perda"}
        />
      </Grid>
    </Grid>
  );
};

const Inventory = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estado para formulário e dialogs
  const [openMaterialForm, setOpenMaterialForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStockAdjustDialog, setOpenStockAdjustDialog] = useState(false);
  const [stockOperation, setStockOperation] = useState('adicionar'); // 'adicionar' ou 'remover'
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    estoque: 0,
    descricao: '',
    categoria: '',
    fornecedor: '',
    unidade: ''
  });
  
  // Paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carregar materiais
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getAll();
      setMaterials(response.data);
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
      setError('Não foi possível carregar os materiais. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para carregar materiais na inicialização
  useEffect(() => {
    fetchMaterials();
  }, []);
  
  // Lidar com criação/edição de material
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedMaterial) {
        await materialService.update(selectedMaterial.id, formData);
        setSuccess('Material atualizado com sucesso!');
      } else {
        await materialService.create(formData);
        setSuccess('Material criado com sucesso!');
      }
      
      setOpenMaterialForm(false);
      setSelectedMaterial(null);
      setIsEditMode(false);
      fetchMaterials();
      
      // Resetar formulário
      setFormData({
        nome: '',
        estoque: 0,
        descricao: '',
        categoria: '',
        fornecedor: '',
        unidade: ''
      });
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar material:', err);
      setError('Não foi possível salvar o material. Tente novamente mais tarde.');
    }
  };
  
  // Lidar com exclusão de material
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;
    
    try {
      await materialService.delete(selectedMaterial.id);
      setOpenDeleteDialog(false);
      setSelectedMaterial(null);
      setSuccess('Material excluído com sucesso!');
      fetchMaterials();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao excluir material:', err);
      if (err.response && err.response.status === 400 && err.response.data.usedInProducts) {
        setError(`Não é possível excluir este material pois está sendo usado em ${err.response.data.usedInProducts} produto(s).`);
      } else {
        setError('Não foi possível excluir o material. Tente novamente mais tarde.');
      }
    }
  };
  
  // Ajustar estoque
  const handleStockAdjust = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !formData.quantidade) return;
    
    try {
      await materialService.updateStock(
        selectedMaterial.id, 
        formData.quantidade, 
        stockOperation
      );
      
      setOpenStockAdjustDialog(false);
      setSelectedMaterial(null);
      setSuccess(`Estoque ${stockOperation === 'adicionar' ? 'adicionado' : 'removido'} com sucesso!`);
      fetchMaterials();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao ajustar estoque:', err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message || 'Erro ao ajustar estoque.');
      } else {
        setError('Não foi possível ajustar o estoque. Tente novamente mais tarde.');
      }
    }
  };
  
  // Abrir formulário para editar material
  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      nome: material.nome,
      estoque: material.estoque,
      descricao: material.descricao || '',
      categoria: material.categoria || '',
      fornecedor: material.fornecedor || '',
      unidade: material.unidade || ''
    });
    setIsEditMode(true);
    setOpenMaterialForm(true);
  };
  
  // Abrir formulário para criar material
  const handleOpenCreateForm = () => {
    setFormData({
      nome: '',
      estoque: 0,
      descricao: '',
      categoria: '',
      fornecedor: '',
      unidade: ''
    });
    setIsEditMode(false);
    setOpenMaterialForm(true);
  };
  
  // Abrir formulário para ajustar estoque
  const handleOpenStockAdjustForm = (material, operation) => {
    setSelectedMaterial(material);
    setFormData({
      nome: material.nome,
      estoque: material.estoque,
      unidade: material.unidade || '',
      quantidade: 0,
      motivo: ''
    });
    setStockOperation(operation);
    setOpenStockAdjustDialog(true);
  };
  
  // Filtrar materiais pelo termo de busca
  const filteredMaterials = materials.filter(material => {
    return (
      (material.nome && material.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (material.descricao && material.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (material.categoria && material.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
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
        Gerenciamento de Estoque
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar materiais por nome, descrição ou categoria..."
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
            Novo Material
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
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Estoque</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Fornecedor</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterials
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((material) => (
                      <TableRow hover key={material.id}>
                        <TableCell>{material.nome}</TableCell>
                        <TableCell>{material.categoria || "-"}</TableCell>
                        <TableCell align="right">
                          {material.estoque}
                          {material.estoque <= 10 && (
                            <Typography 
                              component="span" 
                              sx={{ color: 'error.main', ml: 1, fontWeight: 'bold' }}
                            >
                              (Baixo)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{material.unidade || "-"}</TableCell>
                        <TableCell>{material.fornecedor || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="success"
                            title="Adicionar estoque"
                            onClick={() => handleOpenStockAdjustForm(material, 'adicionar')}
                          >
                            <AddStockIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="warning"
                            title="Remover estoque"
                            onClick={() => handleOpenStockAdjustForm(material, 'remover')}
                          >
                            <RemoveStockIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            title="Editar material"
                            onClick={() => handleEditMaterial(material)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            title="Excluir material"
                            onClick={() => {
                              setSelectedMaterial(material);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                  {filteredMaterials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum material encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMaterials.length}
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
      
      {/* Diálogo de criação/edição de material */}
      <FormDialog
        open={openMaterialForm}
        handleClose={() => {
          setOpenMaterialForm(false);
          setIsEditMode(false);
          setSelectedMaterial(null);
        }}
        title={isEditMode ? "Editar Material" : "Novo Material"}
        onSubmit={handleSubmitMaterial}
      >
        <MaterialForm 
          formData={formData}
          setFormData={setFormData}
          isEdit={isEditMode}
        />
      </FormDialog>
      
      {/* Diálogo de ajuste de estoque */}
      <FormDialog
        open={openStockAdjustDialog}
        handleClose={() => setOpenStockAdjustDialog(false)}
        title={stockOperation === 'adicionar' ? "Adicionar Estoque" : "Remover Estoque"}
        onSubmit={handleStockAdjust}
      >
        <StockAdjustForm 
          formData={formData}
          setFormData={setFormData}
          operacao={stockOperation}
        />
      </FormDialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <ConfirmationDialog
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o material "${selectedMaterial?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteMaterial}
        confirmButtonText="Excluir"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default Inventory;
