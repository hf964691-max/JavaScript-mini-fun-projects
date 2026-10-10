# Weather App

A lightweight weather application with a browser-based frontend and an Express API. Search for a city to view its current temperature, conditions, humidity, feels-like temperature, and wind speed.

Weather data is provided by the [OpenWeather Current Weather API](https://openweathermap.org/current).

## Features

- Look up current weather by city name.
- Display temperature in Celsius, weather conditions, feels-like temperature, humidity, and wind speed.
- Fetch weather data through a small backend API, keeping the OpenWeather API key out of frontend code.
- Return clear JSON responses for successful requests and API errors.

## Requirements

- Node.js 18 or newer (the backend uses the built-in `fetch` API).
- An OpenWeather API key.
- A modern web browser.

## Getting started

### 1. Configure the backend

Open a terminal in the `backend` directory, install dependencies, and create a `.env` file:

```bash
cd backend
npm install
```

Add the following to `backend/.env`, replacing the value with your OpenWeather API key:

```dotenv
API_KEY=your_openweathermap_api_key
```

The `.env` file is ignored by Git. Do not commit your API key.

### 2. Start the API server

From the `backend` directory, run:

```bash
npm run dev
```

For a regular start without automatic restarts, use `npm start`. By default, the API listens at `http://localhost:4000`. Set `PORT` in `backend/.env` if you need a different port; if you change it, update the frontend request URL in `frontend/js/app.js` to match.

### 3. Serve the frontend

Serve the `frontend` directory with a local static web server and open the URL it provides. For example, you can use the Live Server extension in Visual Studio Code and open `frontend/index.html`.

Keep the backend running while using the frontend. The browser calls the API at `http://localhost:4000`.

## API

### `GET /`

Health check. Returns HTTP `200` when the server is running.

```json
{
  "statusCode": 200,
  "data": {
    "service": "weather-api"
  },
  "message": "Server is running.",
  "success": true
}
```

### `GET /api/weather?city={city}`

Returns current weather for the requested city. For example:

```text
http://localhost:4000/api/weather?city=London
```

Successful responses use the following envelope; `data` contains the weather object returned by OpenWeather:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Weather retrieved.",
  "success": true
}
```

Errors return a non-2xx HTTP status and a JSON response with `success: false`. Common cases include:

| Status | Meaning |
| --- | --- |
| `400` | The `city` query parameter is missing or blank. |
| `404` | The requested city was not found, or the route does not exist. |
| `500` | The server is missing its weather API configuration or encountered an internal error. |
| `502` | The weather provider could not be reached or returned an invalid response. |
| `503` | The weather provider is temporarily rate limited. |

## Project structure

```text
weather-app/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   └── utils/
│   ├── .env                 # Create locally; do not commit
│   └── package.json
└── frontend/
    ├── css/style.css
    ├── index.html
    └── js/app.js
```

## Troubleshooting

- **The browser cannot connect to the API:** confirm the backend is running on port `4000` and that the frontend request URL matches the backend port.
- **The API reports that weather service configuration is missing:** check that `backend/.env` exists and contains a non-empty `API_KEY`.
- **The city cannot be found:** check the spelling and try a city name recognized by OpenWeather.
- **The key is rejected or requests are limited:** confirm the OpenWeather key is active and check your provider account's usage limits.
