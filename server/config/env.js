const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoose: {
    url: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assetflow',
    options: {
      // Modern mongoose handles connection options natively, but keeping options object in case of expansion
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret_please_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  }
};
