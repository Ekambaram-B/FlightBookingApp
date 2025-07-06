import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const FlightResults = () => {
  const [flights, setFlights] = useState({ singleTrip: [], roundTrip: [] });
  const [sortKey, setSortKey] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSingleFlight, setSelectedSingleFlight] = useState(null);
  const [selectedRoundFlight, setSelectedRoundFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Memoize query parameters
  const searchParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      source: query.get("source"),
      destination: query.get("destination"),
      date: query.get("date"),
      roundTrip: query.get("roundTrip") === "true",
      returnDate: query.get("returnDate"),
    };
  }, [location.search]);

  const { source, destination, date, roundTrip, returnDate } = searchParams;

  // Validate search parameters
  useEffect(() => {
    if (!source || !destination || !date) {
      setError("Invalid search parameters");
      return;
    }
    if (roundTrip && !returnDate) {
      setError("Return date is required for round trip");
      return;
    }
  }, [source, destination, date, roundTrip, returnDate]);

  const fetchFlights = useCallback(async () => {
    if (!source || !destination || !date) return;
    setLoading(true);
    setError("");
    try {
      const singleResponse = await axios.get("http://localhost:5000/flights", {
        params: {
          source,
          destination,
          date,
          sortBy: sortKey,
          order: sortOrder,
          page,
          limit: 5,
        },
      });
      let roundTripResponse = { data: { flights: [] } };
      if (roundTrip && returnDate) {
        roundTripResponse = await axios.get("http://localhost:5000/flights", {
          params: {
            source: destination,
            destination: source,
            date: returnDate,
            sortBy: sortKey,
            order: sortOrder,
            page,
            limit: 5,
          },
        });
      }
      setFlights({
        singleTrip: singleResponse.data.flights || [],
        roundTrip: roundTripResponse.data.flights || [],
      });
      setTotalPages(Math.ceil((singleResponse.data.totalResults || 0) / 5));
    } catch (err) {
      setError("Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    source,
    destination,
    date,
    roundTrip,
    returnDate,
    sortKey,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleSort = useCallback(
    (key) => {
      const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
      setSortKey(key);
      setSortOrder(newOrder);
      setPage(1); // Reset to first page when sorting
    },
    [sortKey, sortOrder]
  );

  const handleFlightSelect = useCallback((flight, isRoundTrip) => {
    if (isRoundTrip) {
      setSelectedRoundFlight(flight);
    } else {
      setSelectedSingleFlight(flight);
    }
  }, []);

  const handleContinueToBooking = useCallback(() => {
    if (!selectedSingleFlight) {
      alert("Please select a flight to continue");
      return;
    }
    if (roundTrip && !selectedRoundFlight) {
      alert("Please select a return flight to continue");
      return;
    }

    navigate("/booking", {
      state: {
        singleFlightId: selectedSingleFlight._id,
        roundTripFlightId: selectedRoundFlight?._id || null,
      },
    });
  }, [selectedSingleFlight, selectedRoundFlight, roundTrip, navigate]);

  const renderFlights = useCallback(
    (flightsArray, isRoundTrip = false) => {
      if (!flightsArray.length) {
        return <p>No flights found.</p>;
      }

      return flightsArray.map((flight) => {
        const isSelected = isRoundTrip
          ? selectedRoundFlight?._id === flight._id
          : selectedSingleFlight?._id === flight._id;

        return (
          <div
            key={flight._id}
            style={{
              ...cardStyle,
              backgroundColor: isSelected ? "#d0ebff" : "white",
              borderColor: isSelected ? "#339af0" : "#ccc",
              cursor: "pointer",
            }}
            onClick={() => handleFlightSelect(flight, isRoundTrip)}
          >
            <p>
              <strong> Airline:</strong> {flight.airline || "N/A"}
            </p>
            <p>
              <strong>Flight No:</strong> {flight.flightNumber || "N/A"}
            </p>
            <p>
              <strong>From:</strong> {flight.source} → {flight.destination}
            </p>
            <p>
              <strong>Departure:</strong> {flight.departureTime || "N/A"} |
              <strong> Arrival:</strong> {flight.arrivalTime || "N/A"}
            </p>
            <p>
              <strong> Price:</strong> ₹{flight.price || "N/A"}
            </p>
          </div>
        );
      });
    },
    [selectedSingleFlight, selectedRoundFlight, handleFlightSelect]
  );

  const canProceed =
    selectedSingleFlight && (!roundTrip || selectedRoundFlight);

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Results</h2>

      {loading && <p>Loading flights...</p>}

      <div className="sort-container">
        <strong> Sort By: </strong>
        <button
          onClick={() => handleSort("price")}
          className="sort-btn"
          disabled={loading}
        >
          Price {sortKey === "price" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("departureTime")}
          className="sort-btn"
          disabled={loading}
        >
          Departure{" "}
          {sortKey === "departureTime" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("arrivalTime")}
          className="sort-btn"
          disabled={loading}
        >
          Arrival{" "}
          {sortKey === "arrivalTime" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3>Onward Flights</h3>
          {renderFlights(flights.singleTrip)}
        </div>
        {roundTrip && (
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h3>Return Flights</h3>
            {renderFlights(flights.roundTrip, true)}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {canProceed && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleContinueToBooking} style={buttonStyle}>
            Continue to Booking
          </button>
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "5px",
  padding: "10px",
  marginBottom: "10px",
  transition: "all 0.2s ease",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "rgb(87, 150, 226)",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
};

export default FlightResults;
