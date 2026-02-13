const API_KEY = "d57b1cdceeca286f4a6b1a54e63ad75b";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const card = document.getElementById("weatherResult");
const forecastDiv = document.getElementById("forecast");
const errorMsg = document.getElementById("errorMsg");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") getWeather();
});
document.getElementById("themeToggle").addEventListener("click", toggleTheme);

async function getWeather() {
    let city = cityInput.value.trim();

    errorMsg.classList.add("hidden");
    card.classList.add("hidden");
    forecastDiv.classList.add("hidden");
    loader.classList.remove("hidden");

    if (!city) {
        showError("Please enter a city name");
        loader.classList.add("hidden");
        return;
    }

    if (!city.includes(",")) {
        city += ",IN";
    }

    try {
        const response = await fetch(
            `${WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        // ✅ Update UI
        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temperature").innerText =
            `🌡️ ${Math.round(data.main.temp)} °C`;
        document.getElementById("condition").innerText =
            `☁️ ${data.weather[0].description}`;
        document.getElementById("humidity").innerText =
            `💧 ${data.main.humidity}%`;
        document.getElementById("wind").innerText =
            `🌬️ ${data.wind.speed} m/s`;

        const iconCode = data.weather[0].icon;
        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // 🌈 Background + Particles
        const weatherCondition = data.weather[0].main;
        setBackground(weatherCondition);

        loader.classList.add("hidden");
        card.classList.remove("hidden");

        getForecast(city);

    } catch (error) {
        loader.classList.add("hidden");
        showError(error.message);
    }
}

async function getForecast(city) {
    forecastDiv.innerHTML = "";

    try {
        const response = await fetch(
            `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if (data.cod !== "200") return;

        const dailyData = data.list.filter((item, index) => index % 8 === 0);

        dailyData.slice(0, 5).forEach(day => {
            const date = new Date(day.dt_txt);
            const temp = Math.round(day.main.temp);
            const icon = day.weather[0].icon;

            const item = document.createElement("div");
            item.classList.add("forecast-item");

            item.innerHTML = `
                <p>${date.toDateString().slice(0, 3)}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p>${temp}°C</p>
            `;

            forecastDiv.appendChild(item);
        });

        forecastDiv.classList.remove("hidden");

    } catch (error) {
        console.log("Forecast error:", error);
    }
}

function showError(message) {
    errorMsg.innerText = "❌ " + message;
    errorMsg.classList.remove("hidden");
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

/* 🌈 BACKGROUND SYSTEM */

function setBackground(condition) {
    condition = condition.toLowerCase();

    document.body.classList.remove(
        "clear", "clouds", "rain", "thunder", "snow", "default"
    );

    if (condition.includes("clear")) {
        document.body.classList.add("clear");
    }
    else if (condition.includes("cloud")) {
        document.body.classList.add("clouds");
    }
    else if (condition.includes("rain")) {
        document.body.classList.add("rain");
    }
    else if (condition.includes("thunder")) {
        document.body.classList.add("thunder");
    }
    else if (condition.includes("snow")) {
        document.body.classList.add("snow");
    }
    else {
        document.body.classList.add("default");
    }

    // ✨ Update particles
    updateParticles(condition);
}

/* ✨ PARTICLE SYSTEM */

function createParticles(type) {
    const container = document.getElementById("particles");
    container.innerHTML = "";

    const count = type === "rain" ? 80 : 50;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle", type);

        particle.style.left = Math.random() * 100 + "vw";
        particle.style.animationDuration = (Math.random() * 2 + 1) + "s";
        particle.style.opacity = Math.random();

        container.appendChild(particle);
    }
}

function updateParticles(condition) {
    if (condition.includes("rain")) {
        createParticles("rain");
    }
    else if (condition.includes("snow")) {
        createParticles("snow");
    }
    else {
        document.getElementById("particles").innerHTML = "";
    }
}
