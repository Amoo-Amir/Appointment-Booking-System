const express = require("express");
const route = express.Router();

const booking = require("../controller/booking.controller");
const auth = require("../middleware/auth");

route.post("/make-book", auth, booking.makebook);
route.post("/cancel-book/:id", auth, booking.cancelBooking);
route.post("/confirm-booking/:id", auth, booking.confirmBooking);

route.get("/get-mybookings", auth, booking.getmybookings);
route.get("/get-mybooking/:id", auth, booking.getBookingById);
route.get("/available-slots", auth, booking.getAvailableSlots);

route.put("/update-booking", auth, booking.updatebooked);
route.delete("/delete-booking", auth, booking.deletebooked);

module.exports = { route };
