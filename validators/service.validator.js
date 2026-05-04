const Joi = require('joi');

const createServiceSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  duration: Joi.number().min(15).max(240).required()
    .messages({
      'number.min': 'مدت زمان حداقل ۱۵ دقیقه',
      'number.max': 'مدت زمان حداکثر ۲۴۰ دقیقه'
    }),
  price: Joi.number().min(0).required(),
  isAvailable: Joi.boolean().default(true)
});

const updateServiceSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500),
  duration: Joi.number().min(15).max(240),
  price: Joi.number().min(0),
  availability: Joi.boolean()
});

module.exports = {
  createServiceSchema,
  updateServiceSchema
};