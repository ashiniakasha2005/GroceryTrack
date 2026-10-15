import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

// Product Routes
app.use('/api', productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});