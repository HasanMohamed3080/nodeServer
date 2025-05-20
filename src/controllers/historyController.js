import { History } from "../models/History.js";

// مزامنة سجل المبيعات
export const syncHistory = async (req, res) => {

    console.log(`🟡 [زامن السجل] تم استدعاء الدالة للمستخدم: ${req.user?._id}`);

    const history = req.body;
    console.log(`📦 [زامن السجل] بيانات السجل المُستلمة:`, history);

    try {
        // حذف السجل القديم للمستخدم
        await History.deleteMany({ userId: req.user._id });

        // تجهيز السجل الجديد وإضافة معرف المستخدم
        const histories = history.map(item => ({
            ...item,
            userId: req.user._id,
        }));

        // حفظ السجل الجديد في قاعدة البيانات
        await History.insertMany(histories);

        console.log(`✅ [زامن السجل] تم مزامنة السجل بنجاح للمستخدم: ${req.user?._id}`);
        res.status(200).json({ message: "✅ تم مزامنة السجل بنجاح" });

    } catch (error) {
        console.error(`❌ [زامن السجل] حدث خطأ أثناء مزامنة السجل للمستخدم ${req.user?._id}:`, error);
        res.status(500).json({ error: "❌ فشل في مزامنة السجل" });
    }

};

// الحصول على سجل المبيعات
export const getHistory = async (req, res) => {
    console.log(`🟢 [جلب السجل] تم استدعاء الدالة للمستخدم: ${req.user?._id}`);

    try {
        const histories = await History.find({ userId: req.user._id });
        console.log(`📋 [جلب السجل] تم استرجاع السجل للمستخدم ${req.user?._id}:`, histories);
        res.status(200).json(histories);

    } catch (error) {
        console.error(`❌ [جلب السجل] حدث خطأ أثناء استرجاع السجل للمستخدم ${req.user?._id}:`, error);
        res.status(500).json({ error: "❌ فشل في استرجاع السجل" });
    }
};
