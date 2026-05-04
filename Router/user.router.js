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

Route.put("/updateprofile", updateProfileSchema, usercontroller.updateprofile);
Route.put("/changepassword", authmidd, usercontroller.changepassword);
Route.delete("/deleteacc", usercontroller.deleteaccount);

module.exports = { Route };
