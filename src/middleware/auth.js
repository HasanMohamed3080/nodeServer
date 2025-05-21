import mongoose from 'mongoose'; // Import mongoose
import User from '../models/User.js'; // Ensure User model is correctly imported

// التحقق من المستخدم (using plain ID from Authorization header)
export const authenticateUser = async (req, res, next) => {
  console.log('[وسيط المصادقة] جاري التحقق من المصادقة...');
  try {
    // الحصول على المعرف من رأس الطلب Authorization
    const userId = req.headers.authorization;
    console.log(`[وسيط المصادقة] تم استلام ترويسة التفويض: ${userId}`);

    // التحقق من وجود المعرف
    if (!userId) {
      console.error('[وسيط المصادقة] خطأ: ترويسة التفويض مفقودة أو فارغة.');
      return res.status(401).json({ success: false, error: 'غير مصرح به - المعرف مطلوب في رأس Authorization' });
    }

    // التحقق من أن المعرف هو ObjectId صالح قبل البحث في قاعدة البيانات
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`[وسيط المصادقة] خطأ: تم استلام صيغة معرف غير صالحة: ${userId}`);
         return res.status(401).json({ success: false, error: 'غير مصرح به - معرف المستخدم غير صالح' });
    }

    // البحث عن المستخدم باستخدام المعرف
    console.log(`[وسيط المصادقة] محاولة العثور على المستخدم بالمعرف: ${userId}`);
    const user = await User.findById(userId);

    // التحقق من وجود المستخدم
    if (!user) {
      console.error(`[وسيط المصادقة] خطأ: لم يتم العثور على المستخدم للمعرف: ${userId}`);
      return res.status(401).json({ success: false, error: 'غير مصرح به - المستخدم غير موجود' });
    }

    // التحقق من حظر المستخدم
    if (user.isBanned) {
      console.warn(`[وسيط المصادقة] تم رفض الوصول: المستخدم ${userId} محظور.`);
      return res.status(403).json({ success: false, error: 'تم حظر حسابك' });
    }

    // إذا تم العثور على المستخدم ولم يكن محظورًا
    console.log(`[وسيط المصادقة] تمت مصادقة المستخدم بنجاح: ${user._id}`);
    req.user = user; // Attach user object to the request
    return next(); // Proceed to the next middleware/controller

  } catch (error) {
    console.error('[وسيط المصادقة] حدث خطأ غير متوقع أثناء المصادقة:', error);
    res.status(500).json({ success: false, error: 'خطأ في الخادم أثناء المصادقة' });
  } ;


}