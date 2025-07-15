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
  Tab,
  FormHelperText,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { productService, materialService } from '../services/api';
import FormDialog, { ConfirmationDialog } from '../components/FormDialog';

// Componente de formulário para produtos
const ProductForm = ({ formData, setFormData, isEdit, materiais }) => {
  // Verifica se o produto é uma camisa
  const isTShirt = formData.categoria && formData.categoria.toLowerCase() === 'camisa';
  const [formTab, setFormTab] = useState(0);
  
  // Estado local para os materiais selecionados
  const [selectedMateriais, setSelectedMateriais] = useState(formData.materiais || []);

  // Quando selectedMateriais muda, atualiza o formData
  useEffect(() => {
    setFormData({
      ...formData,
      materiais: selectedMateriais
    });
  }, [selectedMateriais]);
  
  const handleAddMaterial = () => {
    if (formData.materialId && formData.materialQuantidade > 0) {
      const materialSelecionado = materiais.find(m => m.id === formData.materialId);
      if (!materialSelecionado) return;
      
      // Verifica se o material já foi adicionado
      const materialJaAdicionado = selectedMateriais.find(m => m.id === formData.materialId);
      
      if (materialJaAdicionado) {
        // Atualiza a quantidade se já estiver na lista
        setSelectedMateriais(selectedMateriais.map(m => 
          m.id === formData.materialId 
            ? { ...m, quantidade: formData.materialQuantidade } 
            : m
        ));
      } else {
        // Adiciona novo material à lista
        setSelectedMateriais([
          ...selectedMateriais, 
          { 
            id: materialSelecionado.id,
            nome: materialSelecionado.nome,
            quantidade: formData.materialQuantidade,
            unidade: materialSelecionado.unidade || 'un'
          }
        ]);
      }
      
      // Limpa os campos de seleção
      setFormData({
        ...formData,
        materialId: '',
        materialQuantidade: 1
      });
    }
  };
  
  const handleRemoveMaterial = (materialId) => {
    setSelectedMateriais(selectedMateriais.filter(m => m.id !== materialId));
  };

  return (
    <>
      <Tabs 
        value={formTab} 
        onChange={(e, newValue) => setFormTab(newValue)}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab label="Informações Básicas" />
        <Tab label="Materiais Necessários" />
      </Tabs>
      
      {formTab === 0 && (
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
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Categoria"
              value={formData.categoria || ''}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            >
              <MenuItem value="camisa">Camisa</MenuItem>
              <MenuItem value="banner">Banner</MenuItem>
              <MenuItem value="adesivo">Adesivo</MenuItem>
              <MenuItem value="cartão">Cartão de Visita</MenuItem>
              <MenuItem value="papel">Papel</MenuItem>
              <MenuItem value="outro">Outro</MenuItem>
            </TextField>
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
              label="Fornecedor"
              value={formData.fornecedor || ''}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
              required={isTShirt}
              helperText={isTShirt ? "Obrigatório para camisas" : ""}
            />
          </Grid>
          
          {isTShirt && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cor"
                  value={formData.cor || ''}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material"
                  value={formData.material || ''}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                  helperText="Ex: Algodão, Poliéster, etc."
                />
              </Grid>
            </>
          )}
          
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
      )}
      
      {formTab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Adicione os materiais necessários para produzir este produto
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Material</InputLabel>
              <Select
                value={formData.materialId || ''}
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                label="Material"
              >
                <MenuItem value="" disabled>
                  Selecione um material
                </MenuItem>
                {materiais.map((material) => (
                  <MenuItem key={material.id} value={material.id}>
                    {material.nome} ({material.estoque} {material.unidade} disponíveis)
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Selecione um material do estoque</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Quantidade"
              value={formData.materialQuantidade || 1}
              onChange={(e) => setFormData({ 
                ...formData, 
                materialQuantidade: parseInt(e.target.value) || 1 
              })}
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="contained" 
              color="primary"
              onClick={handleAddMaterial}
              sx={{ height: '56px' }} // Para alinhar com os outros campos
              disabled={!formData.materialId || !formData.materialQuantidade}
            >
              <AddIcon />
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              Materiais selecionados:
            </Typography>
            
            {selectedMateriais.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum material adicionado
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Unidade</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedMateriais.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>{material.nome}</TableCell>
                        <TableCell align="right">{material.quantidade}</TableCell>
                        <TableCell align="right">{material.unidade}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveMaterial(material.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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
    categoria: '',
    fornecedor: '',
    cor: '',
    material: '',
    materiais: [],
    materialId: '',
    materialQuantidade: 1
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

  // Carregar materiais
  const fetchMaterials = async () => {
    try {
      const response = await materialService.getAll();
      setMaterials(response.data);
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
      setError('Não foi possível carregar os materiais para associação.');
    }
  };
  
  // Efeito para carregar produtos e materiais na inicialização
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchMaterials()]);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Lidar com criação/edição de produto
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      // Verificação de validação para camisas
      if (formData.categoria === 'camisa') {
        if (!formData.fornecedor || !formData.cor || !formData.material) {
          setError('Para camisas, os campos Fornecedor, Cor e Material são obrigatórios.');
          return;
        }
      }

      // Criar objeto de dados para envio
      const productData = {
        nome: formData.nome,
        preco: formData.preco,
        estoque: formData.estoque,
        descricao: formData.descricao,
        categoria: formData.categoria,
        fornecedor: formData.fornecedor,
        cor: formData.cor,
        material: formData.material,
        materiais: formData.materiais || []
      };

      if (isEditMode && selectedProduct) {
        await productService.update(selectedProduct.id, productData);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        await productService.create(productData);
        setSuccess('Produto criado com sucesso!');
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
        categoria: '',
        fornecedor: '',
        cor: '',
        material: '',
        materiais: [],
        materialId: '',
        materialQuantidade: 1
      });
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
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
      categoria: product.categoria || '',
      fornecedor: product.fornecedor || '',
      cor: product.cor || '',
      material: product.material || '',
      materiais: product.materiais || [],
      materialId: '',
      materialQuantidade: 1
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
      categoria: '',
      fornecedor: '',
      cor: '',
      material: ''
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
                    <TableCell>Fornecedor</TableCell>
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="right">Estoque</TableCell>
                    <TableCell>Materiais</TableCell>
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
                        <TableCell>{product.fornecedor || "-"}</TableCell>
                        <TableCell align="right">R$ {(product.preco || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">{product.estoque}</TableCell>
                        <TableCell>
                          {product.materiais && product.materiais.length > 0 ? (
                            <Typography variant="body2">
                              {`${product.materiais.length} ${product.materiais.length === 1 ? 'material' : 'materiais'} usado(s)`}
                            </Typography>
                          ) : (
                            product.categoria === 'camisa' ? (
                              <span>
                                {product.material ? `Material: ${product.material}` : ''}
                                {product.cor ? (product.material ? ', ' : '') + `Cor: ${product.cor}` : ''}
                              </span>
                            ) : "-"
                          )}
                        </TableCell>
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
                      <TableCell colSpan={7} align="center">
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
          materiais={materials}
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
