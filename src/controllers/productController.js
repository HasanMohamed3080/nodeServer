import Product from '../models/Product.js';

// ───────────────────────────────────────────────────────
// جلب جميع المنتجات الخاصة بالمستخدم
export const getProduct = async (req, res) => {
  console.log(`[getProduct] Called for user: ${req.user?._id}`);
  
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(`[getProduct] Error fetching products for user ${req.user?._id}:`, error);
    res.status(500).json({ error: 'فشل في جلب المنتجات' });
  }
};

// ───────────────────────────────────────────────────────
// إضافة منتج جديد
export const addProduct = async (req, res) => {
  console.log('[addProduct] Called by user:', req.user?._id);
  console.log('[addProduct] Request body:', req.body);

  try {
    const { name, code, origin, supplier, purchasePrice, salePrice, quantity, alternatives } = req.body;

    // التحقق من الحقول المطلوبة
    if (!name || !code || !origin || !supplier) {
      return res.status(400).json({ 
        error: 'جميع الحقول مطلوبة: الاسم، الكود، المنشأ، المورد' 
      });
    }

    // التحقق من الحقول الرقمية
    if (isNaN(purchasePrice) || isNaN(salePrice) || isNaN(quantity)) {
      return res.status(400).json({ 
        error: 'يجب أن تكون الأسعار والكمية أرقاماً صحيحة' 
      });
    }

    const product = new Product({
      userId: req.user._id,
      name: name.trim(),
      code: code.trim(),
      origin: origin.trim(),
      supplier: supplier.trim(),
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      quantity: Number(quantity),
      alternatives: alternatives && typeof alternatives === 'string'
        ? alternatives.trim().split(',').map(alt => alt.trim())
        : [],
    });

    await product.save();
    console.log('[addProduct] Product saved successfully:', product);

    res.status(201).json(product);
  } catch (error) {
    console.error('[addProduct] Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'هذا الكود مستخدم بالفعل' });
    }

    res.status(500).json({ error: 'فشل إضافة المنتج' });
  }
};

// ───────────────────────────────────────────────────────
// حذف جميع المنتجات الخاصة بالمستخدم
export const deleteAllProducts = async (req, res) => {
  console.log(`[deleteAllProducts] Requested by user: ${req.user?._id}`);

  try {
    const result = await Product.deleteMany({ userId: req.user._id });

    if (result.deletedCount === 0) {
      console.log(`[deleteAllProducts] No products found for user: ${req.user._id}`);
      return res.status(200).json({ message: 'لا توجد منتجات لحذفها' });
    }

    console.log(`[deleteAllProducts] Deleted ${result.deletedCount} products`);
    res.json({ 
      success: true, 
      message: `تم حذف ${result.deletedCount} منتجًا بنجاح`
    });

  } catch (error) {
    console.error('[deleteAllProducts] Error:', error);
    res.status(500).json({ error: 'فشل حذف المنتجات' });
  }
};

// ───────────────────────────────────────────────────────
// مزامنة المنتجات (bulk upsert + حذف المنتجات التي تم حذفها من الـ Client)
export const syncProducts = async (req, res) => {
  console.log('[syncProducts] Called by user:', req.user?._id);

  const products = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'البيانات المرسلة يجب أن تكون قائمة من المنتجات' });
  }

  try {
    // جلب المنتجات الحالية من السيرفر
    const existingProducts = await Product.find({ userId: req.user._id });

    // تحديد المنتجات التي تم حذفها من الـ Client ولم تعد موجودة في البيانات المرسلة
    const productsToDelete = existingProducts.filter(serverProduct => 
      !products.some(clientProduct => clientProduct.code === serverProduct.code)
    );

    // حذف المنتجات التي تم حذفها من الـ Client
    for (const product of productsToDelete) {
      await Product.deleteOne({ _id: product._id });
      console.log(`[syncProducts] Product deleted: ${product.name}`);
    }

    // تنفيذ عملية المزامنة (التحديث والإضافة) للمنتجات المتبقية
    const bulkOps = products.map(product => {
      const {
        name, code, origin, supplier,
        purchasePrice, salePrice, quantity,
        alternatives, updatedAt
      } = product;

      return {
        updateOne: {
          filter: { userId: req.user._id, code },
          update: {
            $set: {
              name: name.trim(),
              origin: origin.trim(),
              supplier: supplier.trim(),
              purchasePrice: Number(purchasePrice),
              salePrice: Number(salePrice),
              quantity: Number(quantity),
              alternatives: (() => {
                if (Array.isArray(alternatives)) {
                  return alternatives.map(alt => alt.trim());
                } else if (typeof alternatives === 'string') {
                  return alternatives.split(',').map(alt => alt.trim());
                } else {
                  return [];
                }
              })(),
              updatedAt: new Date(updatedAt),
            }
          },
          upsert: true // إذا لم يكن المنتج موجودًا في السيرفر، سيتم إضافته
        }
      };
    });

    if (bulkOps.length === 0) {
      return res.status(400).json({ error: 'لا توجد منتجات لمزامنتها' });
    }

    const result = await Product.bulkWrite(bulkOps);
    console.log('[syncProducts] Sync result:', result);

    res.json({
      message: 'تمت مزامنة المنتجات بنجاح',
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error('[syncProducts] Error:', error);
    res.status(500).json({ error: 'فشل مزامنة المنتجات' });
  }
};


export const getAllProducts = async (req, res) => {
  console.log(`[getAllProducts] Called for user: ${req.user?._id}`);
  
  try {
    const products = await Product.find({ userId: req.user._id });
    console.log(`[getAllProducts] Found ${products.length} products for user: ${req.user._id}`);
    res.json(products);
  } catch (error) {
    console.error(`[getAllProducts] Error fetching products for user ${req.user?._id}:`, error);
    res.status(500).json({ error: 'فشل في جلب المنتجات' });
  }
};
