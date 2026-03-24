import { io } from 'socket.io-client';
import { getSocketBaseUrl } from '../config/env';

const SOCKET_URL = getSocketBaseUrl();

let socket = null;

export function connectSocket(userId) {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function joinConversation(conversationId) {
  if (socket?.connected) {
    socket.emit('joinConversation', conversationId);
  }
}

export function leaveConversation(conversationId) {
  if (socket?.connected) {
    socket.emit('leaveConversation', conversationId);
  }
}

export function emitTyping(conversationId, userId, isTyping) {
  if (socket?.connected) {
    socket.emit('typing', { conversationId, userId, isTyping });
  }
}

export function onNewMessage(callback) {
  if (socket) {
    socket.on('newMessage', callback);
  }
}

export function offNewMessage(callback) {
  if (socket) {
    socket.off('newMessage', callback);
  }
}

export function onUserTyping(callback) {
  if (socket) {
    socket.on('userTyping', callback);
  }
}

export function offUserTyping(callback) {
  if (socket) {
    socket.off('userTyping', callback);
  }
}
