const Service = require("../model/services.model");
const asyncHandler = require("../middleware/asynchandler");
const { default: mongoose } = require("mongoose");

const createService = asyncHandler(async (req, res) => {
  const { name, description, duration, price, isAvailable } = req.body;

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

  const existingService = await Service.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingService) {
    return res.status(409).json({
      success: false,
      message: "Service with this name already exists",
    });
  }

  const service = await Service.create({
    user: req.userId,
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

const getServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    isAvailable,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};

  // filter by valiable
  if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable === "true";
  }

  // filter by price
  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // filter by searching
  if (search) {
    filter.$or = [
      {
        name: { $regex: search, $options: "i" },
        description: { $regex: search, $options: "i" },
      },
    ];
  }

  // filter by sorting
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // pagetion
  const skip = (page - 1) * limit;
  const total = await Service.countDocuments(filter);

  const service = await Service.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: service.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    data: service,
  });
});

const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  const service = await Service.findById(id).lean();

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, duration, price, isAvailable } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  const service = await Service.findById(id);
  if (!service) {
    res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400).json({
        success: false,
        message: "Service name cannot be empty",
      });
    }

    const existingService = await Service.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });

    const isOwner = userId === service.user;
    const isAdmin = req.userRole === "admin";

    if (!isOwner && !isAdmin) {
      res.status(400).json({
        success: false,
        message: "you can only access to your own service",
      });
    }

    if (existingService) {
      res.status(409).json({
        success: false,
        message: "Service with this name already exists",
      });
    }
    service.name = name.trim();
  }

  if (duration !== undefined) {
    if (duration < 20) {
      res.status(400).json({
        success: false,
        message: "Duration must be at least 20 minutes",
      });
    }
    service.duration = duration;
  }

  if (price !== undefined) {
    if (price < 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }
    service.price = price;
  }

  if (description !== undefined) {
    service.description = description?.trim();
  }

  if (isAvailable !== undefined) {
    service.isAvailable = isAvailable;
  }

  await service.save();

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});

const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(409).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  const service = await Service.findById(id).select("user");
  if (!service) {
    res.status(404).json({
      success: false,
      message: "service not found",
    });
  }

  const isOwner = userId === service.user;
  const isAdmin = req.userRole === "admin";

  if (!isOwner && !isAdmin) {
    res.status(400).json({
      success: false,
      message: "you can only access to your own service",
    });
  }

  await Service.findByIdAndDelete(id);

  res.status(201).json({
    success: true,
    message: "service deleted successfully",
  });
});

const toggleServiceAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  const service = await Service.findById(id);
  if (!service) {
    res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  service.isAvailable = !service.isAvailable;
  await service.save();

  res.status(200).json({
    success: true,
    message: `Service is now ${service.isAvailable ? "available" : "unavailable"}`,
    data: { isAvailable: service.isAvailable },
  });
});

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceAvailability,
};
