import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register/', data),
  login: (data) => API.post('/auth/login/', data),
  getProfile: () => API.get('/auth/profile/'),
  updateProfile: (data) => API.patch('/auth/profile/', data),
  getFarmers: () => API.get('/auth/farmers/'),
};

export const productsAPI = {
  list: (params) => API.get('/products/', { params }),
  detail: (id) => API.get(`/products/${id}/`),
  create: (data) => API.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.patch(`/products/${id}/`, data),
  delete: (id) => API.delete(`/products/${id}/`),
  myProducts: () => API.get('/products/my/'),
  addReview: (id, data) => API.post(`/products/${id}/review/`, data),
};

export const ordersAPI = {
  place: (data) => API.post('/orders/place/', data),
  myOrders: () => API.get('/orders/my/'),
  farmerOrders: () => API.get('/orders/farmer/'),
  detail: (id) => API.get(`/orders/${id}/`),
  updateStatus: (id, data) => API.patch(`/orders/${id}/`, data),
};

export default API;
