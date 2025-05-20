import express from 'express';
import { authenticateUser } from '../middleware/auth.js'; // Import the middleware
import { syncHistory, getHistory } from '../controllers/historyController.js'; // Import the controller functions

const router = express.Router();

router.use(authenticateUser); 

router.post('/sync', syncHistory); 
router.get('/', getHistory); 

export default router; // Add this line to export the router as default
