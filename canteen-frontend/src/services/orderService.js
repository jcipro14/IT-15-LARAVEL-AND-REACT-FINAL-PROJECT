import api from './api';

export const orderService = {
  getOrders: (params) =>
    api.get('/orders', { params }),

  getOrder: (id) =>
    api.get(`/orders/${id}`),

  createOrder: (data) =>
    api.post('/orders', data),

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  cancelOrder: (id) =>
    api.patch(`/orders/${id}/cancel`),

  getQueue: () =>
    api.get('/orders/queue'),

  getMyOrders: () =>
    api.get('/my-orders'),
};
