import bcrypt from 'bcrypt';
import User from '../models/User.js';
import License from '../models/License.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const toggleBan = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'بيانات غير صحيحة' });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    id: user._id,
    phone: user.phone,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    token
  });
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف وكلمة المرور' });
    }

    const cleanPhone = phone.toString().trim();
    const user = await User.findOne({ phone: cleanPhone });

    // Only check if user exists, is banned, or password is incorrect
    if (!user || user.isBanned || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    // Return user data including _id
    res.json({
      _id: user._id, // Ensure _id is included
      phone: user.phone,
      createdAt: user.createdAt,
      isBanned: user.isBanned
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

export const register = async (req, res) => {
  try {
    const { phone, password, licenseKey } = req.body;

    if (!phone || !password || !licenseKey) {
      return res.status(400).json({ error: 'يرجى إدخال جميع البيانات المطلوبة' });
    }

    // Check if user already exists
    const cleanPhone = phone.toString().trim();
    const existingUser = await User.findOne({ phone: cleanPhone });
    
    if (existingUser) {
      return res.status(400).json({ error: 'رقم الهاتف مستخدم بالفعل' });
    }

    // Check if license key is valid
    const cleanKey = licenseKey.toString().trim().toUpperCase();
    const license = await License.findOne({ key: cleanKey });
    
    if (!license || license.used) {
      return res.status(400).json({ error: 'مفتاح الترخيص غير صالح أو مستخدم بالفعل' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      phone: cleanPhone,
      password: hashedPassword
    });
    
    await user.save();

    // Update license
    license.used = true;
    license.userId = user._id;
    await license.save();

    res.status(201).json({
      id: user._id,
      phone: user.phone,
      createdAt: user.createdAt,
      isBanned: user.isBanned
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التسجيل' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Release any licenses associated with this user
    await License.updateMany(
      { userId: user._id },
      { $set: { used: false, userId: null } }
    );
    
    await User.findByIdAndDelete(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};