import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const FlightSearchForm = () => {
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    date: "",
    returnDate: "",
    roundTrip: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validation functions
  const validateForm = useCallback(() => {
    const { source, destination, date, returnDate, roundTrip } = formData;

    if (!source.trim() || !destination.trim() || !date) {
      return "Please fill all required fields";
    }

    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return "Source and destination cannot be the same";
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return "Departure date cannot be in the past";
    }

    if (roundTrip) {
      if (!returnDate) {
        return "Return date is required for round trip";
      }
      if (returnDate < date) {
        return "Return date cannot be before departure date";
      }
    }

    return null;
  }, [formData]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const query = {
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        date: formData.date,
        roundTrip: formData.roundTrip,
        ...(formData.roundTrip && { returnDate: formData.returnDate }),
      };
      navigate(`/results?${new URLSearchParams(query).toString()}`);
    } catch (error) {
      setError("Failed to search flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container">
      <h3>Flight Search</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Source Airport"
            value={formData.source}
            onChange={(e) => handleInputChange("source", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Destination Airport"
            value={formData.destination}
            onChange={(e) => handleInputChange("destination", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            value={formData.date}
            min={today}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.roundTrip}
              onChange={(e) => handleInputChange("roundTrip", e.target.checked)}
              disabled={loading}
            />
            Round Trip
          </label>
        </div>

        {formData.roundTrip && (
          <div className="form-group">
            <input
              type="date"
              value={formData.returnDate}
              min={formData.date || today}
              onChange={(e) => handleInputChange("returnDate", e.target.value)}
              placeholder="Return Date"
              required={formData.roundTrip}
              disabled={loading}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Flights"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default FlightSearchForm;
