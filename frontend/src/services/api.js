import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://community-hub-project-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT Token to requests — reads from sessionStorage (tab-isolated)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('communityhub_token');
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
  updateNotice: (id, data) => api.put(`/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/notices/${id}`)
};

export const paymentService = {
  getPayments: () => api.get('/payments'),
  getSummary: () => api.get('/payments/summary'),
  generateBills: (data) => api.post('/payments/generate', data),
  createCustomBill: (data) => api.post('/payments/custom', data),
  updateBill: (id, data) => api.put(`/payments/${id}`, data),
  deleteBill: (id) => api.delete(`/payments/${id}`),
  purgePhantomBills: () => api.delete('/payments/purge-phantom'),
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

export const proposalService = {
  getProposals: (params)        => api.get('/proposals', { params }),
  getProposalById: (id)         => api.get(`/proposals/${id}`),
  createProposal: (data)        => api.post('/proposals', data),
  castVote: (id, optionIndex)   => api.post(`/proposals/${id}/vote`, { optionIndex }),
  updateStatus: (id, status)    => api.put(`/proposals/${id}/status`, { status }),
  deleteProposal: (id)          => api.delete(`/proposals/${id}`),
  uploadAttachments: (id, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('attachments', f));
    return api.post(`/proposals/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const auditService = {
  getLogs: (params) => api.get('/audit', { params })
};

export const listingService = {
  getListings: ()             => api.get('/listings'),
  getListing: (id)            => api.get(`/listings/${id}`),
  createListing: (data)       => api.post('/listings', data),
  updateListing: (id, data)   => api.put(`/listings/${id}`, data),
  deleteListing: (id)         => api.delete(`/listings/${id}`),
  expressInterest: (id)       => api.post(`/listings/${id}/interest`),
  uploadImages: (id, files)   => {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return api.post(`/listings/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const marketplaceService = {
  getItems: (params)        => api.get('/marketplace', { params }),
  getItem: (id)             => api.get(`/marketplace/${id}`),
  createItem: (data, files) => {
    if (files && files.length > 0) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      files.forEach(f => fd.append('images', f));
      return api.post('/marketplace', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/marketplace', data);
  },
  updateItem: (id, data, files) => {
    if (files && files.length > 0) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      files.forEach(f => fd.append('images', f));
      return api.put(`/marketplace/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/marketplace/${id}`, data);
  },
  deleteItem: (id)          => api.delete(`/marketplace/${id}`),
  uploadImages: (id, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return api.post(`/marketplace/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const amenityService = {
  getAmenities: ()                    => api.get('/amenities'),
  getAmenity: (id)                    => api.get(`/amenities/${id}`),
  createAmenity: (data, files)        => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
    });
    if (files && files.length > 0) files.forEach(f => fd.append('images', f));
    return api.post('/amenities', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateAmenity: (id, data, file)     => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
    });
    if (file) fd.append('image', file);
    return api.put(`/amenities/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteAmenity: (id)                 => api.delete(`/amenities/${id}`),
  uploadImages: (id, files)           => {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return api.post(`/amenities/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getBookings: (id, params)           => api.get(`/amenities/${id}/bookings`, { params }),
  getMyBookings: ()                   => api.get('/amenities/my-bookings'),
  createBooking: (id, data)           => api.post(`/amenities/${id}/bookings`, data),
  updateBookingStatus: (bookingId, status) => api.put(`/amenities/bookings/${bookingId}/status`, { status }),
};

