const searchBtn = document.getElementById("searchBtn");
const searchEl = document.getElementById("searchInput");
const searchHistoryButton = document.querySelector("#searchHistory");
let searchHistory = [];

const apiUrl = "https://api.openweathermap.org";
const apiKey = "afe09d5361f7699e655a42a0c502491a";

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function searchCity(e) {
    if (!searchEl.value) {
        return;
    };
    e.preventDefault();

    const search = searchEl.value.trim();

    getCoordinates(search);

    searchEl.value = "";
};

function getCity(cityData) {
    const lat = cityData.lat;
    const lon = cityData.lon;
    const city = cityData.name;

    const url = `${apiUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;

    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            todayCast(city, data.current, data.timezone);
            fiveCast(data.daily, data.timezone);
        })
        .catch(function (err) {
            console.error(err);
        });
};

function getCoordinates(searchData) {
    const url = apiUrl + "/geo/1.0/direct?q=" + searchData + "&limit=5&appid=" + apiKey;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert("Location not found. Please enter a city name.");
            } else {
                addHistory(searchData)
                getCity(data[0]);
                return;
            }
        })
        .catch(function (err) {
            console.log("error: " + err);
        });
    const content = document.getElementById("content");
    content.removeAttribute("class", "hidden");
};

function todayCast(city, weather, time) {

    const date = dayjs().tz(time).format("MMM D YYYY");
    const currentHumidity = document.getElementById("currHumidity");
    const currentWind = document.getElementById("currWind");
    const currentDate = document.getElementById("currDate");
    const currentIcon = document.getElementById("currIcon");
    const currentTemperature = document.getElementById("currTemp");

    const uv = document.getElementById("uv");
    const uvcolor = document.getElementById("uvcolor");
    const weatherIcon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;

    todayCity.textContent = city;
    currentDate.textContent = date;
    currentIcon.setAttribute("src", weatherIcon);
    currentTemperature.textContent = weather.temp;
    currentWind.textContent = weather.wind_speed;
    currentHumidity.textContent = weather.humidity;
    uv.textContent = weather.uvi;

    if (weather.uvi < 3) {
        uvcolor.setAttribute("class", "uvcard green");
    } else if (weather.uvi < 6) {
        uvcolor.setAttribute("class", "uvcard yellow");
    } else if (weather.uvi < 8) {
        uvcolor.setAttribute("class", "uvcard orange");
    } else {
        uvcolor.setAttribute("class", "uvcard red");
    };
    ;
};

function fiveCast(daily, time) {
    const day1 = dayjs().tz(time).add(1, "day").startOf("day").unix();
    const day5 = dayjs().tz(time).add(6, "day").startOf("day").unix();

    for (var i = 0; i < daily.length; i++) {
        if (daily[i].dt >= day1 && daily[i].dt < day5) {
            const timeStamp = daily[i].dt;
            const day = dayjs.unix(timeStamp).tz(time).format("MMM D");
            const date = document.getElementById(`day${i}`);
            const dayIcon = document.getElementById(`day${i}Icon`);
            const dayTemperature = document.getElementById(`day${i}Temp`);
            const dayWind = document.getElementById(`day${i}Wind`);
            const dayHumidity = document.getElementById(`day${i}Humidity`);
            const weatherIcon = `https://openweathermap.org/img/w/${daily[i].weather[0].icon}.png`;

            date.textContent = day;
            dayIcon.setAttribute("src", weatherIcon);
            dayTemperature.textContent = daily[i].temp.max;
            dayWind.textContent = daily[i].wind_speed;
            dayHumidity.textContent = daily[i].humidity;

        };
    };
};

function historyEl() {
    const historySection = document.getElementById("searchHistory");
    historySection.innerHTML = "";
    for (let i = searchHistory.length - 1; i >= searchHistory.length - 5; i--) {
        if (i < 0) {
            return;
        };

        const button = document.createElement("button");
        const space = document.createElement("br");

        button.setAttribute("class", "history");

        button.setAttribute("data-search", searchHistory[i]);
        button.textContent = searchHistory[i];

        historySection.append(button);
        historySection.append(space);
    };
};

function getHistory(e) {
    if (!e.target.matches("button.history")) {
        return;
    };
    const button = e.target;
    const search = button.getAttribute("data-search");
    getCoordinates(search);
};

function addHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    };
    searchHistory.push(search);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    historyEl();
};

function showHistory() {
    const savedHistory = localStorage.getItem("searchHistory");

    if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
    };
    historyEl();
};


showHistory();
searchBtn.onclick = searchCity;
searchHistoryButton.addEventListener("click", getHistory);