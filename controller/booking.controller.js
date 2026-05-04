const Booking = require("../model/bookings.model");
const Service = require("../model/services.model");
const User = require("../model/user.model");
const mongoose = require("mongoose");
const asynchandler = require("../middleware/asynchandler");

const makebook = asynchandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { serviceId, date, timeslot } = req.body;

    if (!serviceId || !date || !timeslot) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: serviceId, date, timeSlot",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "service not found",
      });
    }

    if (!service.isAvailable) {
      return res.status(400).json({ error: "Service is not available" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userbookingstoday = await Booking.countDocuments(
      {
        user: req.userId,
        createdAt: { $gte: today },
        status: { $ne: "cancelled" },
      },
      { session },
    );

    if (userbookingstoday >= 5) {
      return res.status(429).json({
        success: false,
        error: "You cannot book more than 5 appointments per day",
      });
    }

    const bookingdatetime = new Date(`${date}T${timeslot}`);

    const conflictingUserBooking = await Booking.findOne({
      user: req.userId,
      date: bookingdatetime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflictingUserBooking) {
      return res.status(409).json({
        error: "You already have a booking at this time",
      });
    }

    const newbook = new Booking({
      user: req.userId,
      service: serviceId,
      date: bookingdatetime,
      timeSlot: timeslot,
    });

    try {
      await newbook.save({ session });
    } catch (error) {
      if (error.code === 11000) {
        await session.abortTransaction();
        return res.status(409).json({
          error: "This time slot is already booked by another user",
          code: "DUPLICATE_BOOKING",
        });
      }
      throw error;
    }

    await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: { bookingCountToday: 1 },
        lastBookingAt: new Date(),
      },
      { session },
    );

    await session.commitTransaction();

    const populatedBooking = await Booking.findById(newbook._id)
      .populate("user", "email fullName")
      .populate("service", "name duration price");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create booking error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    session.endSession();
  }
});

const cancelBooking = asynchandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("user", "role");

    if (!booking) {
      return res.status(400).json({
        success: false,
        error: "your booking not found.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(403).json({
        success: false,
        error: "Booking is already cancelled.",
      });
    }

    if (booking.status === "completed") {
      return res.status(403).json({
        success: false,
        error: "cannt cancel completed booking.",
      });
    }

    const isAdmin = booking.user?.role === "admin";

    if (booking.user._id.toString() !== req.userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "you can only cancel your ownd bookings.",
      });
    }

    const now = new Date();
    const bookingTime = new Date(booking.date);
    const hoursdiff = (bookingTime - now) / (1000 * 60 * 60);

    if (hoursdiff < 2 && !isAdmin) {
      return res.status(403).json({
        success: false,
        error:
          "You can only cancel bookings at least 2 hours before appointment",
      });
    }

    booking.status = "cancelled";
    booking.version += 1;
    await booking.save({ session });

    await User.findByIdAndUpdate(
      booking.user,
      {
        $inc: { bookingCountToday: -1 },
      },
      { session },
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel booking error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    session.endSession();
  }
});

const getmybookings = asynchandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.userId };

  if (
    status &&
    ["pending", "confirmed", "cancelled", "completed"].includes(status)
  ) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [booking, total] = await Promise.all([
    Booking.find(query)
      .populate("service", "name duration price")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: booking,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  });
});

const getBookingById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate("user", "fullName email")
    .populate("service", "name duration price description");

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "cannt find booking",
    });
  }

  const isAdmin = req?.userRole === "admin";

  if (booking.user._id.toString() !== req.userId && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "only booking owner or admin can see it.",
    });
  }

  res.json({
    success: true,
    booking,
  });
});

const confirmBooking = asynchandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const isAdmin = req.userRole === "admin";
    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, error: "Admin access required" });
    }

    const booking = await Booking.findById(id).session(session);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Only pending bookings can be confirmed",
      });
    }

    booking.status = "confirmed";
    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Confirm booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
});

const getAvailableSlots = asynchandler(async (req, res) => {
  const { serviceId, date } = req.query;

  if (!serviceId || !date) {
    return res.status(400).json({
      error: "serviceId and date are required",
    });
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }

  const startHour = 9;
  const endHour = 18;
  const duration = service.duration;

  const allSlots = [];
  const selectedDate = new Date(date);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      allSlots.push(slotTime);
    }
  }

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedSlots = await Booking.find({
    service: serviceId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed"] },
  }).select("timeSlot");

  const bookedSlotTimes = bookedSlots.map((booking) => booking.timeSlot);

  const availableSlots = allSlots.filter(
    (slot) => !bookedSlotTimes.includes(slot),
  );

  res.json({
    success: true,
    service: service.name,
    date: selectedDate,
    availableSlots,
    totalSlots: allSlots.length,
    bookedSlots: bookedSlotTimes.length,
  });
});

const updatebooked = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { date, timeSlot, service } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "booking id fprmat is not valid",
    });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "booking not found or id is wrong",
    });
  }

  if (booking.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "you can only update your own bookings",
    });
  }

  if (booking.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `cannot update booking with status: ${booking.status}. only pending bookings can be updated`,
    });
  }

  if (booking.date < new Date()) {
    return res.status(400).json({
      success: false,
      message: "cannot update past bookings",
    });
  }

  let updateFields = {};

  if (date !== undefined) {
    const newDate = new Date(date);
    if (newDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "cannot set booking date in the past",
      });
    }
    updateFields.date = newDate;
  }

  if (timeSlot !== undefined) {
    updateFields.timeSlot = timeSlot;
  }

  if (service !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(service)) {
      return res.status(400).json({
        success: false,
        message: "invalid service id format",
      });
    }

    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "service not found",
      });
    }
    updateFields.service = service;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      success: false,
      message: "no valid fields to update",
    });
  }

  const hasTimeChange =
    date !== undefined || timeSlot !== undefined || service !== undefined;

  if (hasTimeChange) {
    const newDate = date !== undefined ? updateFields.date : booking.date;
    const newTimeSlot =
      timeSlot !== undefined ? updateFields.timeSlot : booking.timeSlot;
    const newService =
      service !== undefined ? updateFields.service : booking.service;

    const conflictingBooking = await Booking.findOne({
      _id: { $ne: id },
      service: newService,
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "this time slot is already booked for the selected service",
      });
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { $set: updateFields },
    {
      new: true,
      runValidators: true,
      context: "query",
    },
  )
    .populate("service", "name duration price description")
    .populate("user", "name email");

  res.status(200).json({
    success: true,
    message: "booking updated successfully",
    data: updatedBooking,
  });
});

const deletebooked = asynchandler(async (req, res) => {
  const { id } = req.params;
  const userid = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "user id format isnt valid.",
    });
  }

  const booked = await Booking.findById(id).select("user status date");
  if (!booked) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  if (userid.toString() !== booked.user.toString()) {
    return res.status(403).json({
      success: false,
      message: "you can only delete your owned bookings",
    });
  }

  const allowedstatus = ["pending", "cancelled"];

  if (!allowedstatus.includes(booked.status)) {
    return res.status(400).json({
      success: false,
      message: `cannot delete booking with status: ${booked.status}`,
    });
  }

  if (booked.date < new Date()) {
    return res.status(400).json({
      success: false,
      message: "cannot delete past bookings",
    });
  }

  await Booking.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "booking deleted successfully",
  });
});

module.exports = {
  makebook,
  cancelBooking,
  getmybookings,
  getBookingById,
  confirmBooking,
  getAvailableSlots,
  updatebooked,
  deletebooked,
};
