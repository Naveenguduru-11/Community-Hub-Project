let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join community room
    socket.on('join_community', (communityId) => {
      if (communityId) {
        socket.join(`community_${communityId}`);
        console.log(`Socket ${socket.id} joined room community_${communityId}`);
      }
    });

    // Join user room for targeted notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user room user_${userId}`);
      }
    });

    // Trigger Emergency SOS Broadcast
    socket.on('trigger_sos', (data) => {
      console.log('EMERGENCY SOS TRIGGERED:', data);
      io.to(`community_${data.communityId}`).emit('sos_alert', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!ioInstance) {
    console.warn('Socket.IO not initialized yet');
  }
  return ioInstance;
};

// Helper notification emitters
const emitVisitorApproval = (communityId, residentId, visitorData) => {
  if (ioInstance) {
    ioInstance.to(`user_${residentId}`).emit('visitor_approval_request', visitorData);
    ioInstance.to(`community_${communityId}`).emit('visitor_status_updated', visitorData);
  }
};

const emitComplaintUpdate = (communityId, residentId, complaintData) => {
  if (ioInstance) {
    ioInstance.to(`user_${residentId}`).emit('complaint_status_changed', complaintData);
    ioInstance.to(`community_${communityId}`).emit('complaint_updated', complaintData);
  }
};

const emitNoticePublished = (communityId, noticeData) => {
  if (ioInstance) {
    ioInstance.to(`community_${communityId}`).emit('new_notice', noticeData);
  }
};

const emitPaymentSuccess = (communityId, residentId, paymentData) => {
  if (ioInstance) {
    ioInstance.to(`user_${residentId}`).emit('payment_completed', paymentData);
    ioInstance.to(`community_${communityId}`).emit('payment_updated', paymentData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitVisitorApproval,
  emitComplaintUpdate,
  emitNoticePublished,
  emitPaymentSuccess
};
