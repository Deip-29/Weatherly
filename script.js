// elements from html
const searchBtn = document.querySelector("#searchBtn");
const apiKey="c60b6fb3cb7dd48a8722bdf3fcb16018";

let currentTempC = null;
let isCelsius = true;

const cityInput = document.getElementById("Scity");
const suggestionBox = document.getElementById("citySuggestions");

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