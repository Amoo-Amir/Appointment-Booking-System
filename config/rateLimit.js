const rateLimit = require("express-rate-limit");

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
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "تلاش‌های ناموفق زیاد. لطفاً ۱۵ دقیقه بعد تلاش کنید.",
  },
  keyGenerator: (req) => req.ip,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "از این IP تعداد ثبت‌نام زیاد بوده است. لطفاً بعداً تلاش کنید.",
  },
  keyGenerator: (req) => req.ip,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "تعداد درخواست رزرو زیاد است. لطفاً کمی صبر کنید.",
  },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  bookingLimiter,
};
