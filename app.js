import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import './services/firestoreService.js'; // Initialize Firestore

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import and use routes
import httpRoutes from './routes/httpRoutes.js';
app.use('/api', httpRoutes);

export default app;
