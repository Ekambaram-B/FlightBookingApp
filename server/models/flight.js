// models/flight.js
const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  source: String,
  destination: String,
  date: String,
  departureTime: String,
  arrivalTime: String,
  price: Number,
});

module.exports = mongoose.model("Flight", flightSchema);
