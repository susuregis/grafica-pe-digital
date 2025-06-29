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
import { productService } from '../services/api';
import FormDialog, { ConfirmationDialog } from '../components/FormDialog';

// Componente de formulário para produtos
const ProductForm = ({ formData, setFormData, isEdit }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome do Produto"
          value={formData.nome || ''}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Preço (R$)"
          value={formData.preco || ''}
          onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
          InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
          }}
          inputProps={{ min: 0, step: 0.01 }}
          required
        />
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
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Categoria"
          value={formData.categoria || ''}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
        />
      </Grid>
    </Grid>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para formulário e dialogs
  const [openProductForm, setOpenProductForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: 0,
    estoque: 0,
    descricao: '',
    categoria: ''
  });
  
  // Paginação e filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carregar produtos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para carregar produtos na inicialização
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Lidar com criação/edição de produto
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedProduct) {
        await productService.update(selectedProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      
      setOpenProductForm(false);
      setSelectedProduct(null);
      setIsEditMode(false);
      fetchProducts();
      
      // Resetar formulário
      setFormData({
        nome: '',
        preco: 0,
        estoque: 0,
        descricao: '',
        categoria: ''
      });
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError('Não foi possível salvar o produto. Tente novamente mais tarde.');
    }
  };
  
  // Lidar com exclusão de produto
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await productService.delete(selectedProduct.id);
      setOpenDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      setError('Não foi possível excluir o produto. Tente novamente mais tarde.');
    }
  };
  
  // Abrir formulário para editar produto
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      nome: product.nome,
      preco: product.preco,
      estoque: product.estoque,
      descricao: product.descricao || '',
      categoria: product.categoria || ''
    });
    setIsEditMode(true);
    setOpenProductForm(true);
  };
  
  // Abrir formulário para criar produto
  const handleOpenCreateForm = () => {
    setFormData({
      nome: '',
      preco: 0,
      estoque: 0,
      descricao: '',
      categoria: ''
    });
    setIsEditMode(false);
    setOpenProductForm(true);
  };
  
  // Filtrar produtos pelo termo de busca
  const filteredProducts = products.filter(product => {
    return (
      (product.nome && product.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.descricao && product.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.categoria && product.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
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
        Gerenciamento de Produtos
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
            placeholder="Buscar produtos por nome, descrição ou categoria..."
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
            Novo Produto
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
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="right">Estoque</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow hover key={product.id}>
                        <TableCell>{product.nome}</TableCell>
                        <TableCell>{product.categoria || "-"}</TableCell>
                        <TableCell align="right">R$ {(product.preco || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">{product.estoque}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditProduct(product)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedProduct(product);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProducts.length}
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
      
      {/* Diálogo de criação/edição de produto */}
      <FormDialog
        open={openProductForm}
        handleClose={() => {
          setOpenProductForm(false);
          setIsEditMode(false);
          setSelectedProduct(null);
        }}
        title={isEditMode ? "Editar Produto" : "Novo Produto"}
        onSubmit={handleSubmitProduct}
      >
        <ProductForm 
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
        message={`Tem certeza que deseja excluir o produto "${selectedProduct?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteProduct}
        confirmButtonText="Excluir"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default Products;
