const express = require("express");
const { getFlights, getFlightById } = require("../controllers/flightController");
const router = express.Router();

router.get("/", getFlights);
router.get("/:id", getFlightById);

module.exports = router;
