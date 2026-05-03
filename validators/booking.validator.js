const Joi = require('joi');

const createBookingSchema = Joi.object({
  serviceId: Joi.string().required(),
  date: Joi.date().greater('now').required()
    .messages({
      'date.greater': 'تاریخ رزرو باید در آینده باشد'
    }),
  time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({
      'string.pattern.base': 'زمان باید در فرمت HH:MM باشد'
    })
});

const cancelBookingSchema = Joi.object({
  bookingId: Joi.string().required()
});

const getBookingsQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled'),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string().valid('date', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

module.exports = {
  createBookingSchema,
  cancelBookingSchema,
  getBookingsQuerySchema
};