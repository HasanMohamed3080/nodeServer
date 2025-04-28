import { v4 as uuidv4 } from 'uuid';
import License from '../models/License.js';

export const getStats = async (req, res) => {
  try {
    const total = await License.countDocuments();
    const used = await License.countDocuments({ used: true });
    res.json({ total, used, available: total - used });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get all licenses
export const getLicenses = async (req, res) => {
  try {
    const licenses = await License.find().sort({ createdAt: -1 });
    res.json(licenses);
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المفاتيح' });
  }
};

// Create new licenses
export const createLicenses = async (req, res) => {
  try {
    const { count } = req.body;
    
    if (!count || count < 1) {
      return res.status(400).json({ error: 'يرجى تحديد عدد صحيح من المفاتيح' });
    }
    
    const licenses = [];
    
    for (let i = 0; i < count; i++) {
      const key = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
      
      const license = new License({
        key,
        used: false
      });
      
      await license.save();
      licenses.push(license);
    }
    
    res.status(201).json(licenses);
  } catch (error) {
    console.error('Create licenses error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المفاتيح' });
  }
};

// Delete a license
export const deleteLicense = async (req, res) => {
  try {
    const id = req.params.id;
    
    const license = await License.findById(id);
    
    if (!license) {
      return res.status(404).json({ error: 'المفتاح غير موجود' });
    }
    
    if (license.used) {
      return res.status(400).json({ error: 'لا يمكن حذف مفتاح مستخدم' });
    }
    
    await License.findByIdAndDelete(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete license error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المفتاح' });
  }
};