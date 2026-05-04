const rateLimit = require("express-rate-limit");

// تابع کمکی استاندارد برای مدیریت IPv4 و IPv6
const getKey = (req) => {
  // روش استاندارد و امن برای گرفتن IP
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message:
      "تعداد درخواست‌های شما از حد مجاز بیشتر شده است. لطفاً ۱۵ دقیقه دیگر تلاش کنید.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ❌ keyGenerator را حذف کنید (کتابخانه خودکار IP را مدیریت می‌کند)
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "تلاش‌های ناموفق زیاد. لطفاً ۱۵ دقیقه بعد تلاش کنید.",
  },
  // ❌ keyGenerator را حذف کنید
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "از این IP تعداد ثبت‌نام زیاد بوده است. لطفاً بعداً تلاش کنید.",
  },
  // ❌ keyGenerator را حذف کنید
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "تعداد درخواست رزرو زیاد است. لطفاً کمی صبر کنید.",
  },
  // ✅ فقط اینجا به keyGenerator نیاز دارید (برای شناسایی کاربر)
  keyGenerator: (req) => {
    // برای رزرو، اولویت با userId است، در غیر این صورت IP
    const identifier = req.user?._id?.toString() || getKey(req);
    return identifier;
  },
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  bookingLimiter,
};