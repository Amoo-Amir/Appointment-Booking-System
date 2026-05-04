const express = require("express");

const usercontroller = require("../controller/user.controller");
const authmidd = require("../middleware/auth");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validators/auth.validator");
const authvalidate = require("../validators/auth.validator")
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");

const Route = express.Router();

Route.get("/profile", authmidd, usercontroller.profile);

Route.post("/register", validate(registerSchema), usercontroller.register);
Route.post("/login", validate(loginSchema), usercontroller.login);

Route.put("/updateprofile/:id", auth ,validate(updateProfileSchema), usercontroller.updateprofile);
Route.put("/changepassword", authmidd, usercontroller.changepassword);
Route.delete("/deleteacc",auth, usercontroller.deleteaccount);

module.exports = { Route };
