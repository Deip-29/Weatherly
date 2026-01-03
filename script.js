// elements from html
const searchBtn = document.querySelector("#searchBtn");
const apiKey="c60b6fb3cb7dd48a8722bdf3fcb16018";

let currentTempC = null;
let isCelsius = true;

const cityInput = document.getElementById("Scity");
const suggestionBox = document.getElementById("citySuggestions");
const weatherBackgrounds = {
  clear: "https://images.pexels.com/photos/46160/field-clouds-sky-earth-46160.jpeg",

  clouds: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXByeWd2NXVuZGd6M3oxeDZ3ZW9lZnF1dHdsbjF3cXJ0cGZnOXQzYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ImmmGydHd0cGuKMauw/giphy.webp",

  rain: "https://media1.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHJwNGNraXNkdzV3cWpuOW54ZGM5dnRrMmJjZmJtMG1wM3Zqamo4eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GYRbm1riP47nWtLeo7/giphy.webp",

  thunderstorm: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTVlamQ0ODh1a3ljaHY5MjgyYzRrYXI5bzE0eXBoNXg1cWVwbGpsayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JDPsfIOg1uL6M/giphy.webp",

  snow: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExanAwcHRwOXFsd2JrNDhseHU5cG4xZzRyeGtqazFleHd1cmo2eHQ3bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BDucPOizdZ5AI/giphy.webp",

  mist: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXg0bGdsbTZ5bjMzazFsNnhkY2J4cDM1YjV0dWhydm03cGlnZzF6OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yhZr5Wx7CBFbq/200.webp"
};

// listners


suggestionBox.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const city = e.target.textContent.trim();
    cityInput.value = city;
    suggestionBox.classList.add("hidden");
    getWeatherByCity(city);
  }
});



  document.getElementById("unitToggle").addEventListener("click", () => {   // toggle logic
  if (currentTempC === null) return;

  if (isCelsius) {
    const f = (currentTempC * 9) / 5 + 32;
    document.querySelector(".temp").textContent = `${Math.round(f)}°F`;
    document.getElementById("unitToggle").textContent = "°C";
  } else {
    document.querySelector(".temp").textContent = `${Math.round(currentTempC)}°C`;
    document.getElementById("unitToggle").textContent = "°F";
  }

  isCelsius = !isCelsius;
});

document.querySelector(".date").textContent =
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  console.log(city); // ALWAYS check first

  if (city === "") {
    showError("Please enter a city name");
    return;
  }

  getWeatherByCity(city);
  saveCity(city);
  // getFiveDayForecast(city);
});

window.addEventListener("load", () => {
  getWeatherByCurrentLocation();
});

cityInput.addEventListener("focus", () => {
  showSuggestions();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#Scity")) {
    suggestionBox.classList.add("hidden");
  }
});
cityInput.addEventListener("input", (e) => {
  showSuggestions(e.target.value);
});
window.addEventListener("load", populateCityDropdown);    // putting event listener on change 
//Function
function showSuggestions(filter = "") {                            // logic to show suggestions
  const list = document.getElementById("citySuggestions");
  const cities = JSON.parse(sessionStorage.getItem("cities")) || [];

  const filtered = cities.filter(city =>
    city.toLowerCase().includes(filter.toLowerCase())
  );

  if (!filtered.length) {
    list.classList.add("hidden");
    return;
  }

  list.innerHTML = filtered
    .map(
      city => `
      <li
        class="px-4 py-2 cursor-pointer hover:bg-gray-100"
      >
        ${city}
      </li>
    `
    )
    .join("");

  list.classList.remove("hidden");
}
function getWeatherByCurrentLocation() {                     /// to get current location wheather insightes
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      getWeatherByCoords(lat, lon);
    },
    () => {
      showError("Location access denied");
    }
  );
}
function saveCity(city) {
  let cities = JSON.parse(sessionStorage.getItem("cities")) || [];

  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);

  if (cities.length > 5) cities.pop();

  sessionStorage.setItem("cities", JSON.stringify(cities));
}
async function getWeatherByCity(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    updateUI(data);

    
    const { lat, lon } = data.coord;
    get5DayForecast(lat, lon);

  } catch (error) {
    showError(error.message);
  }
}

function displayFiveDayForecast(forecastList) {                              //creating list for forcast
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const dailyForecast = forecastList.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyForecast.forEach(day => {
    const date = new Date(day.dt_txt).toDateString();
    const temp = Math.round(day.main.temp);
    const wind = day.wind.speed;
    const humidity = day.main.humidity;
    const icon = day.weather[0].icon;
    console.log(day.wind.speed)

    const card = `
      <div class="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center">
        <p class="font-semibold">${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="mx-auto" />
        <p class="text-xl font-bold">${temp}°C</p>
        <p class="text-sm">💨 ${wind} m/s</p>
        <p class="text-sm">💧 ${humidity}%</p>
      </div>
    `;

    forecastContainer.innerHTML += card;
  });
}
async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Location weather failed");

    const data = await response.json();

    updateUI(data);

    //Reuse same coords
    get5DayForecast(lat, lon);

  } catch (error) {
    showError(error.message);
  }
}
function setWeatherIcon(iconCode) {
  document.getElementById("weatherIcon").src = 
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
// function to show error 
function showError(message) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}



async function get5DayForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Forecast not available");

    const data = await response.json();

   
    displayFiveDayForecast(data.list);

  } catch (error) {
    showError(error.message);
  }
}


function setDynamicBackground(weatherMain) {     // to set bg 
  const bg = document.getElementById("weather-bg");

  let key = weatherMain.toLowerCase();

  if (key.includes("cloud")) key = "clouds";
  if (key.includes("rain") || key.includes("drizzle")) key = "rain";
  if (key.includes("thunder")) key = "thunderstorm";
  if (key.includes("snow")) key = "snow";
  if (key.includes("mist") || key.includes("fog") || key.includes("haze")) key = "mist";
  if (key.includes("clear")) key = "clear";

  bg.style.backgroundImage =
    `url('${weatherBackgrounds[key] || weatherBackgrounds.clouds}')`;
}