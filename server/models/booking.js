const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  flightIds: [String], 
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
