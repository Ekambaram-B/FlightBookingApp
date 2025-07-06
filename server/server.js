const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const flightRoutes = require("./routes/flight");
const bookingRoutes = require("./routes/booking");
const connectDB = require("./config/db");
const Flight = require("./models/flight");
dotenv.config();
connectDB();

mongoose.connection.once("open", () => {
  console.log("✅ Connected to DB:", mongoose.connection.name); // Logs FlightDB
  console.log("📦 Flights model uses collection:", Flight.collection.name);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/flights", flightRoutes);
app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
