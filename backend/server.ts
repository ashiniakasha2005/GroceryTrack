import 'dotenv/config'; // මේ පේළිය උඩින්ම එකතු කරන්න
import express from 'express';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});