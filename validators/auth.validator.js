const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required().messages({
    "string.min": "نام باید حداقل ۳ حرف باشد",
    "string.max": "نام نمی‌تواند بیشتر از ۵۰ حرف باشد",
    "any.required": "نام الزامی است",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "ایمیل معتبر نیست",
    "any.required": "ایمیل الزامی است",
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "رمز عبور باید حداقل ۶ حرف باشد",
      "string.pattern.base":
        "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک و یک عدد باشد",
      "any.required": "رمز عبور الزامی است",
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .optional()
    .messages({
      "string.pattern.base": "شماره تلفن باید ۱۱ رقم باشد",
    }),
  secretkey: Joi.string().optional().messages({
    "string.base": "سری کلید باید متن باشد",
  }),
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{11}$/),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
