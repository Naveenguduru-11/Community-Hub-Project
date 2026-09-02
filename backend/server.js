const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./services/socketService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const communityRoutes = require('./routes/communityRoutes');
const villaRoutes = require('./routes/villaRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const auditRoutes = require('./routes/auditRoutes');
const listingRoutes = require('./routes/listingRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const amenityRoutes = require('./routes/amenityRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.IO Handler
initSocket(io);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'CommunityHub SaaS Backend',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/villas', villaRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/amenities', amenityRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 CommunityHub Backend API Server running on port ${PORT}`);
    console.log(`⚡ Socket.IO Real-Time Communications Online`);
    console.log(`=================================================`);
  });
});
