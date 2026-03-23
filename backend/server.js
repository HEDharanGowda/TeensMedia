require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDatabase } = require('./db/connect');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Setup Socket.IO
    const io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Store io instance in app for use in controllers
    app.set('io', io);

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join user to their personal room for receiving messages
      socket.on('join', (userId) => {
        if (userId) {
          socket.join(`user_${userId}`);
          console.log(`User ${userId} joined room user_${userId}`);
        }
      });

      // Handle typing indicator
      socket.on('typing', ({ conversationId, userId, isTyping }) => {
        socket.to(`conversation_${conversationId}`).emit('userTyping', {
          conversationId,
          userId,
          isTyping,
        });
      });

      // Join conversation room
      socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation_${conversationId}`);
      });

      // Leave conversation room
      socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} left conversation_${conversationId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Socket.IO enabled for real-time messaging');
      console.log('Vision API key loaded:', Boolean(process.env.GOOGLE_API_KEY));
      console.log('JWT secret loaded:', Boolean(process.env.JWT_SECRET));
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
