import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [sosAlert, setSosAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize socket connection to backend
    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 5,
      timeout: 10000
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket Connected to server ID:', socketInstance.id);
      if (user) {
        if (user.community?._id || user.community) {
          const commId = user.community._id || user.community;
          socketInstance.emit('join_community', commId);
        }
        socketInstance.emit('join_user', user._id);
      }
    });

    // Listen to Emergency SOS Alert Broadcast
    socketInstance.on('sos_alert', (data) => {
      console.log('🚨 EMERGENCY SOS BROADCAST RECEIVED:', data);
      setSosAlert(data);
      addNotification({
        id: Date.now(),
        type: 'EMERGENCY',
        title: `EMERGENCY ALERT: ${data.alertType || 'SECURITY SOS'}`,
        message: `Triggered at ${data.location || 'Gate 1'} by ${data.senderName || 'Security'}`,
        time: new Date()
      });
    });

    // Listen to visitor approval / arrival alerts
    socketInstance.on('visitor_approval_request', (data) => {
      addNotification({
        id: Date.now(),
        type: 'VISITOR',
        title: 'Visitor Update',
        message: `Visitor ${data.name} (${data.visitorType}) status is now: ${data.status}`,
        time: new Date()
      });
    });

    socketInstance.on('complaint_status_changed', (data) => {
      addNotification({
        id: Date.now(),
        type: 'COMPLAINT',
        title: 'Complaint Update',
        message: `Complaint "${data.title}" changed status to ${data.status}`,
        time: new Date()
      });
    });

    socketInstance.on('new_notice', (data) => {
      addNotification({
        id: Date.now(),
        type: 'NOTICE',
        title: `Notice: ${data.title}`,
        message: data.content?.substring(0, 80) + '...',
        time: new Date()
      });
    });

    socketInstance.on('payment_completed', (data) => {
      addNotification({
        id: Date.now(),
        type: 'PAYMENT',
        title: 'Payment Successful',
        message: `Paid ₹${data.totalAmount} for ${data.title}`,
        time: new Date()
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev.slice(0, 19)]);
  };

  const triggerSOS = (alertType = 'SECURITY_ALERT', location = 'Main Gate 1') => {
    if (socket && user) {
      const commId = user.community?._id || user.community;
      socket.emit('trigger_sos', {
        communityId: commId,
        senderName: user.name,
        senderRole: user.role,
        alertType,
        location
      });
    }
  };

  const dismissSosAlert = () => setSosAlert(null);

  return (
    <SocketContext.Provider value={{
      socket,
      sosAlert,
      notifications,
      triggerSOS,
      dismissSosAlert
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
