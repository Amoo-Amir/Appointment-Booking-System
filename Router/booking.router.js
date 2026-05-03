const express = require("express");
const route = express.Router();

const booking = require("../controller/booking.controller");
const auth = require("../middleware/auth");

route.post("/make-book", auth, booking.makebook);
route.post("/cancel-book/:id", auth, booking.cancelBooking); // تصحیح 5

route.get("/get-mybookings", auth, booking.getmybookings);
route.get("/get-mybooking/:id", auth, booking.getBookingById); // تصحیح 5

route.post("/confirm-booking/:id", auth, booking.confirmBooking); // تصحیح 5

module.exports = { route };