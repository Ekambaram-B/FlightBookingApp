import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

jest.mock("axios");

describe("Flight Booking App", () => {
  test("renders FlightSearchForm fields", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Source Airport")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Destination Airport")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Search Flights/i })
    ).toBeInTheDocument();
  });

  test("shows error on empty FlightSearchForm submit", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Search Flights/i })
    );

    expect(
      await screen.findByText(/Please fill all required fields/i)
    ).toBeInTheDocument();
  });

  test("rejects same source and destination", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("Source Airport"),
      "DEL"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Destination Airport"),
      "DEL"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "" }),
      "2099-12-12"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Search Flights/i })
    );

    expect(
      await screen.findByText(/Source and destination cannot be the same/i)
    ).toBeInTheDocument();
  });

  test("round trip requires return date", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("Source Airport"),
      "DEL"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Destination Airport"),
      "BOM"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "" }),
      "2099-12-12"
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: /Round Trip/i })
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Search Flights/i })
    );

    expect(
      await screen.findByText(/Return date is required/i)
    ).toBeInTheDocument();
  });

  test("renders FlightResults sort buttons", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/results?source=DEL&destination=BOM&date=2099-12-12",
        ]}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sort By/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Price/i })).toBeInTheDocument();
  });

  test("shows error when missing search params", () => {
    render(
      <MemoryRouter initialEntries={["/results"]}>
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Invalid search parameters/i)
    ).toBeInTheDocument();
  });

  test("pagination previous button disabled on first page", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/results?source=DEL&destination=BOM&date=2099-12-12",
        ]}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
  });

  test("renders FlightBookingPage form fields", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking",
            state: {
              singleFlightId: "123",
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
  });

  test("shows validation error for missing Full Name", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking",
            state: {
              singleFlightId: "123",
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Book Flight/i })
    );

    expect(
      await screen.findByText(/Full Name is required/i)
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid email", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking",
            state: {
              singleFlightId: "123",
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByLabelText(/Email Address/i),
      "bademail"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Book Flight/i })
    );

    expect(
      await screen.findByText(/Please enter a valid email/i)
    ).toBeInTheDocument();
  });

  test("shows validation error for invalid phone", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking",
            state: {
              singleFlightId: "123",
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByLabelText(/Phone Number/i),
      "123abc"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Book Flight/i })
    );

    expect(
      await screen.findByText(/Phone number must be 10 or 11 digits/i)
    ).toBeInTheDocument();
  });

  test("submits FlightBookingPage successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: { bookingId: "BOOK123" },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking",
            state: {
              singleFlightId: "123",
            },
          },
        ]}
      >
        <App />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByLabelText(/Full Name/i),
      "John Doe"
    );
    await userEvent.type(
      screen.getByLabelText(/Email Address/i),
      "john@example.com"
    );
    await userEvent.type(
      screen.getByLabelText(/Phone Number/i),
      "1234567890"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Book Flight/i })
    );

    expect(
      await screen.findByText(/Booking Confirmed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/john@example.com/i)
    ).toBeInTheDocument();
  });
});
