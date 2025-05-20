import Statistics from '../models/Statics.js';

// مزامنة الإحصائيات
export const syncStatistics = async (req, res) => {
    console.log(`🟡 [زامن الإحصائيات] تم استدعاء الدالة للمستخدم: ${req.user?._id}`);

    const statisticsData = req.body;
    console.log(`📦 [زامن الإحصائيات] بيانات الإحصائيات المُستلمة:`, statisticsData);

    try {
        // حذف الإحصائيات القديمة للمستخدم
        await Statistics.deleteMany({ userId: req.user._id });

        // تجهيز الإحصائيات الجديدة وإضافة معرف المستخدم
        const statistics = new Statistics({
            userId: req.user._id,
            ...statisticsData
        });

        // حفظ الإحصائيات الجديدة في قاعدة البيانات
        const savedStatistics = await statistics.save();
        console.log(`📦 [زامن الإحصائيات] البيانات المحفوظة:`, savedStatistics);

        console.log(`✅ [زامن الإحصائيات] تم مزامنة الإحصائيات بنجاح للمستخدم: ${req.user?._id}`);
        res.status(200).json({ message: "✅ تم مزامنة الإحصائيات بنجاح" });

    } catch (error) {
        console.error(`❌ [زامن الإحصائيات] حدث خطأ أثناء مزامنة الإحصائيات للمستخدم ${req.user?._id}:`, error);
        res.status(500).json({ error: "❌ فشل في مزامنة الإحصائيات" });
    }
};

// الحصول على الإحصائيات
export const getStatistics = async (req, res) => {
    console.log(`🟢 [جلب الإحصائيات] تم استدعاء الدالة للمستخدم: ${req.user?._id}`);

    try {
        const statistics = await Statistics.findOne({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!statistics) {
            return res.status(404).json({ error: 'No statistics found' });
        }

        console.log(`📋 [جلب الإحصائيات] تم استرجاع الإحصائيات للمستخدم ${req.user?._id}:`, statistics);
        res.status(200).json(statistics);

    } catch (error) {
        console.error(`❌ [جلب الإحصائيات] حدث خطأ أثناء استرجاع الإحصائيات للمستخدم ${req.user?._id}:`, error);
        res.status(500).json({ error: "❌ فشل في استرجاع الإحصائيات" });
    }
};
