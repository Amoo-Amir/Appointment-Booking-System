
const express = require("express");

const serviceController = require("../controller/services.controller");
const authmidd = require("../middleware/auth");
const {
  createServiceSchema,
  updateServiceSchema,
} = require("../validators/service.validator");

const Route = express.Router();


Route.get("/", serviceController.getServices);
Route.get("/:id", serviceController.getServiceById);


Route.post("/create-service-admin", authmidd, createServiceSchema, serviceController.createService);
Route.put("/update-service-admin/:id", authmidd, updateServiceSchema, serviceController.updateService);
Route.patch("/update-service-admin/:id", authmidd, updateServiceSchema, serviceController.updateService);
Route.delete("/delete-service-admin/:id", authmidd, serviceController.deleteService);
Route.patch("/:id/toggle-availability", authmidd, serviceController.toggleServiceAvailability);

module.exports = { Route };