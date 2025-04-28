import express from 'express';
import {
  getUsers,
  toggleBan,
  login,
  register,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// مسارات المستخدمين
router.get('/', getUsers);                // للحصول على جميع المستخدمين
router.post('/login', login);             // لتسجيل الدخول
router.post('/register', register);       // للتسجيل

// مسارات إدارة المستخدمين
router.put('/:id/ban', toggleBan);        // لحظر/إلغاء حظر مستخدم
router.delete('/:id', deleteUser);        // لحذف مستخدم

export default router;