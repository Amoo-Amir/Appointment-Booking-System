const express = require("express");
const services = require("../controller/services.controller");
const auth = require("../middleware/auth");

const route = express.Router();

route.post("/make-service", auth, services.createService);

module.exports = { route };
