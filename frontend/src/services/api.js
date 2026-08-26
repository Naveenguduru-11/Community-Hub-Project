import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT Token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('communityhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;

// API Endpoint Helper Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAllResidents: () => api.get('/auth/residents'),
  updateResidentStatus: (id, status) => api.put(`/auth/residents/${id}/status`, { status }),
  deleteResident: (id) => api.delete(`/auth/residents/${id}`),
  addFamilyMember: (data) => api.post('/auth/family', data),
  removeFamilyMember: (id) => api.delete(`/auth/family/${id}`),
  registerVehicle: (data) => api.post('/auth/vehicles', data),
  getVehicles: () => api.get('/auth/vehicles')
};

export const visitorService = {
  createPass: (data) => api.post('/visitors', data),
  getVisitors: () => api.get('/visitors'),
  checkIn: (passcode) => api.post('/visitors/checkin', { passcode }),
  checkOut: (id) => api.put(`/visitors/${id}/checkout`),
  deletePass: (id) => api.delete(`/visitors/${id}`)
};

export const complaintService = {
  createComplaint: (data) => api.post('/complaints', data),
  getComplaints: () => api.get('/complaints'),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`)
};

export const noticeService = {
  createNotice: (data) => api.post('/notices', data),
  getNotices: () => api.get('/notices'),
  deleteNotice: (id) => api.delete(`/notices/${id}`)
};

export const paymentService = {
  getPayments: () => api.get('/payments'),
  generateBills: (data) => api.post('/payments/generate', data),
  createCustomBill: (data) => api.post('/payments/custom', data),
  updateBill: (id, data) => api.put(`/payments/${id}`, data),
  deleteBill: (id) => api.delete(`/payments/${id}`),
  createOrder: (paymentId, customKeyId, customKeySecret) => api.post('/payments/create-order', { paymentId, customKeyId, customKeySecret }),
  verifyPayment: (data) => api.post('/payments/verify', data)
};

export const eventService = {
  getEvents: () => api.get('/events'),
  createEvent: (data) => api.post('/events', data),
  rsvp: (id, data) => api.post(`/events/${id}/rsvp`, data),
  joinGame: (id, data) => api.post(`/events/${id}/join`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

export const villaService = {
  getVillas: (communityId) => api.get('/villas', { params: { communityId } }),
  createVilla: (data) => api.post('/villas', data),
  assignResident: (data) => api.post('/villas/assign', data)
};

export const communityService = {
  getCommunities: () => api.get('/communities'),
  createCommunity: (data) => api.post('/communities', data),
  updateRate: (id, rate) => api.put(`/communities/${id}/rate`, { maintenanceMonthlyRate: rate })
};

export const analyticsService = {
  getStats: () => api.get('/analytics/dashboard'),
  getDatabaseExplorer: () => api.get('/analytics/database'),
  clearData: () => api.post('/analytics/clear-data')
};
