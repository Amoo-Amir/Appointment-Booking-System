const Service = require("../model/services.model");
const asyncHandler = require("../middleware/asynchandler");

const createService = asyncHandler(async (req, res) => {
  const { name, description, duration, price, isAvailable } = req.body;

  // Validation کامل
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Service name is required",
    });
  }

  if (!duration || duration < 5) {
    return res.status(400).json({
      success: false,
      message: "Duration must be at least 5 minutes",
    });
  }

  if (!price || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a positive number",
    });
  }

  // چک کردن تکراری نبودن نام سرویس
  const existingService = await Service.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingService) {
    return res.status(409).json({
      success: false,
      message: "Service with this name already exists",
    });
  }

  // ایجاد سرویس جدید
  const service = await Service.create({
    name: name.trim(),
    description: description?.trim(),
    duration,
    price,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

module.exports = {
  createService,
};
