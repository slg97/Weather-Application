// Replace 'YOUR_API_KEY' with your actual API key from OpenWeatherMap
const apiKey = "3e55aea369dc495e141c304332cdee13";
const baseUrl = "https://api.openweathermap.org/data/2.5/";

document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");
    const currentLocationBtn = document.getElementById("currentLocationBtn");
    const weatherOutput = document.getElementById("weatherOutput");
    const extendedForecast = document.getElementById("extendedForecast");
    const recentCitiesContainer = document.getElementById("recentCitiesContainer");
    const recentCities = document.getElementById("recentCities");

    const RECENT_CITIES_KEY = "recentCities";

    // Load recent cities from local storage
    function loadRecentCities() {
        const cities = JSON.parse(localStorage.getItem(RECENT_CITIES_KEY)) || [];
        if (cities.length > 0) {
            recentCitiesContainer.classList.remove("hidden");
            recentCities.innerHTML = `<option value="" disabled selected>Select a recent city</option>`;
            cities.forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                recentCities.appendChild(option);
            });
        }
    }

    // Save a city to recent cities
    function saveRecentCity(city) {
        let cities = JSON.parse(localStorage.getItem(RECENT_CITIES_KEY)) || [];
        if (!cities.includes(city)) {
            cities.unshift(city); // Add to the top
            if (cities.length > 5) cities.pop(); // Keep only 5 cities
            localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(cities));
        }
    }

    // Fetch current weather by city name
    async function fetchWeatherByCity(city) {
        try {
            weatherOutput.innerHTML = "Loading...";
            const response = await fetch(`${baseUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error("City not found");
            const data = await response.json();
            saveRecentCity(city);
            loadRecentCities();
            displayCurrentWeather(data);
            fetchExtendedForecast(city);
        } catch (error) {
            weatherOutput.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    // Fetch weather for current location
    async function fetchWeatherByLocation(lat, lon) {
        try {
            weatherOutput.innerHTML = "Loading...";
            const response = await fetch(`${baseUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error("Unable to fetch weather for your location");
            const data = await response.json();
            displayCurrentWeather(data);
            fetchExtendedForecast(data.name);
        } catch (error) {
            weatherOutput.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    // Fetch extended forecast
    async function fetchExtendedForecast(city) {
        try {
            extendedForecast.innerHTML = "Loading...";
            const response = await fetch(`${baseUrl}forecast?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error("Unable to fetch extended forecast");
            const data = await response.json();
            displayExtendedForecast(data.list);
        } catch (error) {
            extendedForecast.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    }

    // Display current weather
    function displayCurrentWeather(data) {
        weatherOutput.innerHTML = `
            <div class="weather-card text-center">
                <h2 class="text-xl font-bold">${data.name}</h2>
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="mx-auto">
                <p>${data.weather[0].description.toUpperCase()}</p>
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${data.wind.speed} m/s</p>
            </div>
        `;
    }

    // Display extended forecast
    function displayExtendedForecast(forecast) {
        extendedForecast.innerHTML = forecast
            .filter((_, index) => index % 8 === 0) // Show forecast for every 24 hours
            .map(day => `
                <div class="weather-card text-center">
                    <p class="font-bold">${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="mx-auto">
                    <p>${day.weather[0].description.toUpperCase()}</p>
                    <p>Temp: ${day.main.temp}°C</p>
                    <p>Humidity: ${day.main.humidity}%</p>
                    <p>Wind: ${day.wind.speed} m/s</p>
                </div>
            `).join("");
    }

    // Event listeners
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
        } else {
            alert("Please enter a valid city name.");
        }
    });

    currentLocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => fetchWeatherByLocation(position.coords.latitude, position.coords.longitude),
                () => alert("Unable to fetch your location. Please allow location access.")
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    recentCities.addEventListener("change", () => {
        const city = recentCities.value;
        if (city) fetchWeatherByCity(city);
    });

    // Load initial data
    loadRecentCities();
});
