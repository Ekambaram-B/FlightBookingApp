const Flight = require("../models/flight");

exports.getFlights = async (req, res) => {
  try {
    const { source, destination, date, page = 1, limit = 10, sortBy = "price", order = "asc" } = req.query;
    const query = {};
    if (source) query.source = source;
    if (destination) query.destination = destination;
    if (date) query.date = date;

    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    const total = await Flight.countDocuments(query);
    const flights = await Flight.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ page: Number(page), limit: Number(limit), totalResults: total, flights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
