import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import { ApiError } from "./utils/apiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import cors from 'cors';

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { service: "weather-api" }, "Server is running."),
  );
});

app.get("/api/weather", async (req, res) => {
  const cityParam = Array.isArray(req.query.city) ? req.query.city[0] : req.query.city;
  const city = typeof cityParam === "string" ? cityParam.trim() : "";

  if (!city) {
    throw new ApiError(400, "A city query parameter is required.");
  }

  if (!process.env.API_KEY) {
    throw new ApiError(500, "Weather service is not configured.");
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.search = new URLSearchParams({
    q: city,
    appid: process.env.API_KEY,
    units: "metric",
  }).toString();

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.error("Weather service request failed:", error);
    throw new ApiError(502, "Unable to reach the weather service.");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, "City not found.");
    }
    if (response.status === 429) {
      throw new ApiError(503, "Weather service is temporarily rate limited.");
    }
    console.error(`Weather service returned HTTP ${response.status}.`);
    throw new ApiError(502, "Weather service request failed.");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Weather service returned an invalid response:", error);
    throw new ApiError(502, "Weather service returned an invalid response.");
  }

  if (!data || !data.main || !Array.isArray(data.weather)) {
    throw new ApiError(502, "Weather service returned an incomplete response.");
  }

  return res.status(200).json(new ApiResponse(200, data, "Weather retrieved."));
});

app.use((req, res) => {
  return res.status(404).json({
    statusCode: 404,
    data: null,
    message: "Route not found.",
    success: false,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error instanceof ApiError
    ? error.statusCode
    : error.status === 400
      ? 400
      : 500;
  const message = error instanceof ApiError
    ? error.message
    : statusCode === 400
      ? "Invalid JSON request body."
      : "Internal server error.";

  if (statusCode >= 500 && !(error instanceof ApiError)) {
    console.error("Unhandled server error:", error);
  }

  return res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors: [],
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
