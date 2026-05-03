const express = require("express");

const usercontroller = require("../controller/user.controller");
const authmidd = require("../middleware/auth");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validators/auth.validator");

const Route = express.Router();

Route.get("/profile", authmidd, usercontroller.profile);

Route.post("/register", registerSchema, usercontroller.register);
Route.post("/login", loginSchema, usercontroller.login);

module.exports = { Route };
