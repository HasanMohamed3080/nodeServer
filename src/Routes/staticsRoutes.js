import express from 'express';
import {  getStatistics  , syncStatistics } from '../controllers/staticsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
// Save statistics
router.post('/sync', authenticateUser, syncStatistics);

// Get statistics
router.get('/', authenticateUser ,getStatistics);

export default router;
