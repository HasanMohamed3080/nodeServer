import User from '../models/User.js';
import License from '../models/License.js';

// Admin verification
export const verifyAdmin = async (req, res) => {
  try {
    const { code } = req.body;
    
    // This should match the code in public/js/admin.js
    const ADMIN_CODE = 'HM3080VR';
    
    if (code !== ADMIN_CODE) {
      return res.status(401).json({ error: 'رمز غير صحيح' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من المدير' });
  }
};

// Get dashboard stats
export const getStats = async (req, res) => {
  try {
    // Get license stats
    const totalLicenses = await License.countDocuments();
    const usedLicenses = await License.countDocuments({ used: true });
    
    // Get user stats
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    res.json({
      total: totalLicenses,
      used: usedLicenses,
      available: totalLicenses - usedLicenses,
      users: {
        total: totalUsers,
        active: totalUsers - bannedUsers,
        banned: bannedUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
};