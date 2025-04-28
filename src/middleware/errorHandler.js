// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'خطأ في البيانات المدخلة',
      details: err.errors
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      error: 'البيانات موجودة بالفعل',
      details: err.keyValue
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'معرف غير صالح',
      details: err.path
    });
  }

  res.status(500).json({
    error: 'خطأ في الخادم',
    message: process.env.NODE_ENV === 'production' ? 'حدث خطأ ما' : err.message
  });
};