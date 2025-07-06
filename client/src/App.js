import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlightSearchForm from "./components/SearchFlight";
import FlightResults from "./components/FlightResult";
import FlightBookingPage from "./components/FlightBookingPage";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FlightSearchForm />} />
        <Route path="/results" element={<FlightResults />} />
        <Route path="/booking" element={<FlightBookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
