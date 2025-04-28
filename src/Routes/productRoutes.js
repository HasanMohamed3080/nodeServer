import express from 'express';
import { addProduct, getProduct  ,deleteAllProducts , syncProducts , getAllProducts    } from '../controllers/productController.js';
import { authenticateUser } from '../middleware/auth.js'; // Import the middleware

const router = express.Router();

// Apply the authenticateUser middleware to all task routes
router.use(authenticateUser);
router.delete('/', deleteAllProducts); // Delete all products

// Routes will now require a valid user ID in the Authorization header
router.get('/', getProduct);
router.post('/', addProduct);
router.post('/sync', syncProducts); // 🔥 إضافة هنا
router.get('/getProduct', getAllProducts); // 🔥 إضافة هنا
export default router;
