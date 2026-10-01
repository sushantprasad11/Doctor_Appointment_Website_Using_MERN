const app = require('./app');
const connectDB = require('./config/db');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' });
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });
