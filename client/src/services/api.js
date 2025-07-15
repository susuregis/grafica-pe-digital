import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: 'http://localhost:3002', // Apontando para o servidor na porta correta
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Para debug
api.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Services para o Dashboard
export const dashboardService = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getOrdersPerDay: () => api.get('/api/dashboard/orders-per-day'),
  getTopProducts: () => api.get('/api/dashboard/top-products'),
  getDailyRevenue: (date) => api.get(`/api/dashboard/daily-revenue?date=${date}`),
  getMonthlyRevenue: (month) => api.get(`/api/dashboard/monthly-revenue?month=${month}`)
};

// Services para Clientes
export const clientService = {
  getAll: () => api.get('/api/clients'),
  getById: (id) => api.get(`/api/clients/${id}`),
  create: (data) => api.post('/api/clients', data),
  update: (id, data) => api.put(`/api/clients/${id}`, data),
  delete: (id) => api.delete(`/api/clients/${id}`)
};

// Services para Produtos
export const productService = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`)
};

// Services para Materiais de Estoque
export const materialService = {
  getAll: async () => {
    try {
      console.log('Chamando getAll de materiais');
      const response = await api.get('/api/materials');
      console.log('Resposta do getAll:', response);
      return response;
    } catch (error) {
      console.error('Erro detalhado em materialService.getAll:', error);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Response Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/api/materials/${id}`);
    } catch (error) {
      console.error('Erro em materialService.getById:', error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      console.log('Enviando dados para criação de material:', data);
      const response = await api.post('/api/materials', data);
      console.log('Resposta da criação:', response);
      return response;
    } catch (error) {
      console.error('Erro em materialService.create:', error);
      console.error('Dados enviados:', data);
      console.error('URL:', error.config?.url);
      console.error('Response Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/api/materials/${id}`, data);
    } catch (error) {
      console.error('Erro em materialService.update:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/api/materials/${id}`);
    } catch (error) {
      console.error('Erro em materialService.delete:', error);
      throw error;
    }
  },
  updateStock: async (id, quantidade, operacao) => {
    try {
      return await api.patch(`/api/materials/${id}/stock`, { quantidade, operacao });
    } catch (error) {
      console.error('Erro em materialService.updateStock:', error);
      throw error;
    }
  }
};

// Services para Pedidos
export const orderService = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
  delete: (id) => api.delete(`/api/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  generatePDF: (id) => api.get(`/api/orders/${id}/pdf`, { responseType: 'blob' })
};

const services = {
  dashboardService,
  clientService,
  productService,
  materialService,
  orderService
};

export default services;
