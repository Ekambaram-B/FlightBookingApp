const Booking = require("../models/booking");
const Flight = require("../models/flight");

exports.createBooking = async (req, res) => {
  try {
    const { flightIds, fullName, email, phone } = req.body;

    if (!flightIds || !fullName || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const flights = await Flight.find({ _id: { $in: flightIds } });
    if (flights.length !== flightIds.length) {
      return res.status(400).json({ error: "Invalid flight IDs provided" });
    }

    const booking = await Booking.create({ flightIds, fullName, email, phone });

    res.status(201).json({
      message: "Booking confirmed!",
      bookingId: booking._id,
      tripType: flightIds.length === 2 ? "round-trip" : "one-way",
      flights,
      passenger: { fullName, email, phone },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
