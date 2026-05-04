const express = require("express");
require("dotenv").config();
let PORT = process.env.PORT;
const DB = require("./config/db");
const userRouter = require("./Router/user.router");
const serviceRoute = require("./Router/services.router");
const bookingRouter = require("./Router/booking.router");
const {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  bookingLimiter,
} = require("./config/rateLimit");

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", generalLimiter);

// reate limiter
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/booking", bookingLimiter);

//router
app.use("/api/auth", userRouter.Route);
app.use("/api/service", serviceRoute.Route);
app.use("/api/booking", bookingRouter.route);

// DB
DB();

app.listen(PORT, () => {
  console.log(`running on PORT ${PORT}`);
});
