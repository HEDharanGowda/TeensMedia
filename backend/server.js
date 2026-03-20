require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./db/connect');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Vision API key loaded:', Boolean(process.env.GOOGLE_API_KEY));
      console.log('JWT secret loaded:', Boolean(process.env.JWT_SECRET));
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();