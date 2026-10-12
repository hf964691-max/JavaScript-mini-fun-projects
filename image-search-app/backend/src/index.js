import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { pathToFileURL } from "node:url";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4001;

app.use(cors({ origin: "*", methods: ["GET"] }));

app.get("/", (req, res) => {
  return res.status(200).json({
    statusCode: 200,
    data: { service: "image-search-api" },
    message: "Server is running.",
    success: true,
  });
});

app.get("/api/search", async (req, res, next) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
  const pageValue = typeof req.query.page === "string" ? req.query.page : "1";
  const page = Number(pageValue);

  if (!query) {
    return res.status(400).json({
      statusCode: 400,
      data: null,
      message: "A search query is required.",
      success: false,
    });
  }

  if (query.length > 100) {
    return res.status(400).json({
      statusCode: 400,
      data: null,
      message: "Search queries must be 100 characters or fewer.",
      success: false,
    });
  }

  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    return res.status(400).json({
      statusCode: 400,
      data: null,
      message: "Page must be a whole number between 1 and 1000.",
      success: false,
    });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({
      statusCode: 500,
      data: null,
      message: "Image search service is not configured.",
      success: false,
    });
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.search = new URLSearchParams({
    page: String(page),
    per_page: "30",
    query,
  }).toString();

  let response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Client-ID ${process.env.API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("Unsplash request failed:", error);
    return next(Object.assign(new Error("Unable to reach the image search service."), { statusCode: 502 }));
  }

  if (!response.ok) {
    if (response.status === 429) {
      return next(Object.assign(new Error("Image search is temporarily rate limited. Try again later."), { statusCode: 503 }));
    }

    console.error(`Unsplash returned HTTP ${response.status}.`);
    return next(Object.assign(new Error("The image search service request failed."), { statusCode: 502 }));
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Unsplash returned invalid JSON:", error);
    return next(Object.assign(new Error("The image search service returned an invalid response."), { statusCode: 502 }));
  }

  if (!data || !Array.isArray(data.results) || !Number.isInteger(data.total_pages)) {
    return next(Object.assign(new Error("The image search service returned an incomplete response."), { statusCode: 502 }));
  }

  return res.status(200).json({
    statusCode: 200,
    results: data.results,
    total_pages: data.total_pages,
    success: true,
  });
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

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (statusCode >= 500 && statusCode !== 502 && statusCode !== 503) {
    console.error("Unhandled image search API error:", error);
  }

  return res.status(statusCode).json({
    statusCode,
    data: null,
    message: statusCode >= 500 && ![502, 503].includes(statusCode)
      ? "Internal server error."
      : error.message,
    success: false,
  });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(PORT, () => {
    console.log(`Image search API is running on http://localhost:${PORT}`);
  });
}

export { app };
