import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const FlightBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { singleFlightId, roundTripFlightId } = location.state || {};

  const [singleFlight, setSingleFlight] = useState(null);
  const [roundFlight, setRoundFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!singleFlightId) {
      navigate("/");
      return;
    }

    const fetchFlightDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const singleFlightPromise = axios.get(
          `http://localhost:5000/flights/${singleFlightId}`
        );
        const promises = [singleFlightPromise];

        if (roundTripFlightId) {
          promises.push(
            axios.get(`http://localhost:5000/flights/${roundTripFlightId}`)
          );
        }

        const responses = await Promise.all(promises);

        setSingleFlight(responses[0].data);
        if (responses[1]) {
          setRoundFlight(responses[1].data);
        }
      } catch (err) {
        setError("Failed to load flight details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [singleFlightId, roundTripFlightId, navigate]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters";
    } else if (!/^[A-Za-z]{3,}$/.test(form.fullName.trim())) {
      newErrors.fullName = "Full Name must contain only letters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.phone.trim()) {
      if (!/^\d{10,12}$/.test(form.phone.trim())) {
        newErrors.phone =
          "Phone number must be 10 to 12 digits and contain only numbers";
      }
    }

    return newErrors;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitting(true);
      setError("");

      try {
        const bookingData = {
          flightIds: [
            singleFlightId,
            ...(roundTripFlightId ? [roundTripFlightId] : []),
          ],
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        };

        const response = await axios.post(
          "http://localhost:5000/bookings",
          bookingData
        );

        setSubmitted(true);
        console.log("Booking successful:", response.data);
      } catch (err) {
        console.error("Booking failed", err);
        setError("Booking failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const renderFlightCard = useCallback(
    (flight, label) => (
      <div style={styles.card}>
        <h4>{label}</h4>
        <p>
          <strong>Airline:</strong> {flight.airline || flight.name || "N/A"}
        </p>
        <p>
          <strong>Flight No:</strong> {flight.flightNumber || "N/A"}
        </p>
        <p>
          <strong>From:</strong> {flight.source} → <strong>To:</strong>{" "}
          {flight.destination}
        </p>
        <p>
          <strong>Departure:</strong> {flight.departureTime || "N/A"} |
          <strong> Arrival:</strong> {flight.arrivalTime || "N/A"}
        </p>
        <p>
          <strong>Price:</strong> ₹{flight.price || "N/A"}
        </p>
      </div>
    ),
    []
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading flight details...</p>
      </div>
    );
  }

  if (error && !singleFlight) {
    return (
      <div style={styles.container}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Flight Booking</h2>

      {singleFlight && renderFlightCard(singleFlight, "Onward Flight")}
      {roundFlight && renderFlightCard(roundFlight, "Return Flight")}

      {submitted ? (
        <div style={styles.success}>
          <h3>Booking Confirmed!</h3>
          <p>
            Booking confirmed for <strong>{form.fullName}</strong>!
          </p>
          <p>
            Confirmation sent to <strong>{form.email}</strong>.
          </p>
          <button onClick={() => navigate("/")} style={styles.button}>
            Book Another Flight
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>Passenger Details</h3>

          <div style={styles.formGroup}>
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={submitting}
              style={errors.fullName ? styles.inputError : {}}
            />
            {errors.fullName && <p style={styles.error}>{errors.fullName}</p>}
          </div>

          <div style={styles.formGroup}>
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              style={errors.email ? styles.inputError : {}}
            />
            {errors.email && <p style={styles.error}>{errors.email}</p>}
          </div>

          <div style={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={submitting}
              style={errors.phone ? styles.inputError : {}}
            />
            {errors.phone && <p style={styles.error}>{errors.phone}</p>}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Booking..." : "Book Flight"}
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  card: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  inputError: {
    borderColor: "red",
    backgroundColor: "#ffe6e6",
  },
  error: {
    color: "red",
    fontSize: "0.9em",
    margin: "0",
  },
  success: {
    padding: "20px",
    background: "#e8f5e8",
    border: "1px solid #4caf50",
    borderRadius: "8px",
    textAlign: "center",
  },
  button: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s",
  },
};

export default FlightBookingPage;
