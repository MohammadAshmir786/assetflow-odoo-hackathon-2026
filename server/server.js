const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

let server;

// Uncaught exceptions handler (must be registered at the very top)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to Database
connectDB();

// Start Express Server
server = app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} in ${config.env} mode`);
});

// Unhandled Promise Rejections handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// SIGTERM handler for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated.');
    });
  }
});
