
const weatherDataEl = document.getElementById("weather-data");

const cityInputEl = document.getElementById("city-input");

const formEl = document.querySelector("form");

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const cityValue = cityInputEl.value.trim();
  if (!cityValue) {
    weatherDataEl.querySelector(".description").textContent =
      "Please enter a city name.";
    return;
  }
  getWeatherData(cityValue);
});

async function getWeatherData(cityValue) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/weather?city=${encodeURIComponent(cityValue)}`,
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Unable to retrieve weather data.");
    }
    const data = result.data;

    if (!data || !data.main || !Array.isArray(data.weather) || !data.wind) {
      throw new Error("Weather data is unavailable.");
    }

    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const details = [
      `Feels like: ${Math.round(data.main.feels_like)}℃`,
      `Humidty: ${Math.round(data.main.humidity)}%`,
      `Wind speed: ${Math.round(data.wind.speed)} m/s`,
    ];

    weatherDataEl.querySelector(".icon").innerHTML =
      `<img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">`;
    weatherDataEl.querySelector(".temperature").textContent = `${temperature}℃`;
    weatherDataEl.querySelector(".description").textContent = `${description}`;
    weatherDataEl.querySelector(".details").innerHTML = details
      .map((detail) => `<div>${detail}</div>`)
      .join("");
  } catch (error) {
    weatherDataEl.querySelector(".icon").innerHTML = "";
    weatherDataEl.querySelector(".temperature").textContent = "";
    weatherDataEl.querySelector(".description").textContent =
      error.message || "Unable to retrieve weather data. Please try again later.";
    weatherDataEl.querySelector(".details").innerHTML = "";
  }
}
