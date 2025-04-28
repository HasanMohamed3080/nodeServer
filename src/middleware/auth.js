import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // Import mongoose
import User from '../models/User.js'; // Ensure User model is correctly imported

// Removed the unused 'auth' function that used JWT

// التحقق من المستخدم (using plain ID from Authorization header)
export const authenticateUser = async (req, res, next) => {
  console.log('[Auth Middleware] Checking authentication...');
  try {
    // الحصول على المعرف من رأس الطلب Authorization
    const userId = req.headers.authorization;
    console.log(`[Auth Middleware] Received Authorization header: ${userId}`);

    // التحقق من وجود المعرف
    if (!userId) {
      console.error('[Auth Middleware] Error: Authorization header missing or empty.');
      return res.status(401).json({ success: false, error: 'غير مصرح به - المعرف مطلوب في رأس Authorization' });
    }

    // التحقق من أن المعرف هو ObjectId صالح قبل البحث في قاعدة البيانات
    if (!mongoose.Types.ObjectId.isValid(userId)) {
         console.error(`[Auth Middleware] Error: Invalid ID format received: ${userId}`);
         return res.status(401).json({ success: false, error: 'غير مصرح به - معرف المستخدم غير صالح' });
    }

    // البحث عن المستخدم باستخدام المعرف
    console.log(`[Auth Middleware] Attempting to find user with ID: ${userId}`);
    const user = await User.findById(userId);

    // التحقق من وجود المستخدم
    if (!user) {
      console.error(`[Auth Middleware] Error: User not found for ID: ${userId}`);
      return res.status(401).json({ success: false, error: 'غير مصرح به - المستخدم غير موجود' });
    }

    // التحقق من حظر المستخدم
    if (user.isBanned) {
      console.warn(`[Auth Middleware] Access denied: User ${userId} is banned.`);
      return res.status(403).json({ success: false, error: 'تم حظر حسابك' });
    }

    // إذا تم العثور على المستخدم ولم يكن محظورًا
    console.log(`[Auth Middleware] User authenticated successfully: ${user._id}`);
    req.user = user; // Attach user object to the request
    return next(); // Proceed to the next middleware/controller

  } catch (error) {
    console.error('[Auth Middleware] Unexpected error during authentication:', error);
    res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء المصادقة' });
  } ;


}