import express from 'express';
import { getStats, verifyAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Admin authentication
router.post('/login', verifyAdmin);

// Admin dashboard stats
router.get('/stats', getStats);

export default router;

