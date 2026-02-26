require('dotenv').config();
const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const { connectRedis } = require('./config/redis');
const { prisma } = require('./config/database');

const PORT = process.env.PORT || 4000;

// HTTP 서버
const httpServer = createServer(app);

// Socket.IO (실시간 RSVP 알림)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// Socket 통합 (app에서 접근 가능하게)
app.set('io', io);

// Socket 연결 핸들러
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // 초대장 룸염 입장 (RSVP 실시간 알림 수신)
  socket.on('join:invitation', (invitationId) => {
    socket.join(`invitation:${invitationId}`);
    logger.info(`Socket ${socket.id} joined invitation:${invitationId}`);
  });

  socket.on('leave:invitation', (invitationId) => {
    socket.leave(`invitation:${invitationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// 서버 시작
async function startServer() {
  try {
    // DB 연결 확인
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Redis 연결
    await connectRedis();
    logger.info('✅ Redis connected');

    httpServer.listen(PORT, () => {
      logger.info(`🚀 InviteHub API Server running on port ${PORT}`);
      logger.info(`📌 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📖 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 정상 종료 처리
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

startServer();
