const apiKey = '7b88214d1981eecc55e37cf3d2d98552';
const baseUrl = 'https://api.openweathermap.org/data/2.5';
let today = moment().format('L');
let searchHistoryList = [];

let getCurrentCondition = (city) => {
    let weatherQueryUrl = `${baseUrl}/weather?q=${city}&units=imperial&appid=${apiKey}`;

    $.get(weatherQueryUrl, (response) => {
        $('#weatherContent').css('display', 'block');
        $('#cityDetail').empty();

        let iconCode = response.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

        let currentCity = `
            <h2 id="currentCity">${response.name} ${today} <img src="${iconUrl}" alt="${response.weather[0].description}"></h2>
            <p>Temperature: ${response.main.temp} °F</p>
            <p>Humidity: ${response.main.humidity}\%</p>
            <p>Wind Speed: ${response.wind.speed} MPH</p>
        `;

        $('#cityDetail').append(currentCity);

        getUvIndex(response.coord.lat, response.coord.lon);
    });
}

let getUvIndex = (lat, lon) => {
    let uviQueryUrl = `${baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.get(uviQueryUrl, (response) => {
        let uvIndex = response.value;
    
        let uvIndexBlock = `
            <p>UV Index: 
                <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `;

        $('#cityDetail').append(uvIndexBlock);

        switch (true) {
            case uvIndex >= 0 && uvIndex <= 2:
                $('#uvIndexColor').css('background-color', '#3EA72D').css('color', 'white');
                break;
            case uvIndex >= 3 && uvIndex <= 5:
                $('#uvIndexColor').css('background-color', '#FFF300');
                break;
            case uvIndex >= 6 && uvIndex <= 7:
                $('#uvIndexColor').css('background-color', '#F18B00');
                break;
            case uvIndex >= 8 && uvIndex <= 10:
                $('#uvIndexColor').css('background-color', '#E53210').css('color', 'white');
                break;
            default:
                $('#uvIndexColor').css('background-color', '#B567A4').css('color', 'white'); 
        }

        getFutureCondition(lat, lon);
    });
}

let getFutureCondition = (lat, lon) => {
    let futureQueryUrl = `${baseUrl}/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.get(futureQueryUrl, (response) => {
        $('#fiveDay').empty();
        
        for (let i = 1; i < 6; i++) {
            let cityInfo = {
                date: response.daily[i].dt,
                icon: response.daily[i].weather[0].icon,
                temp: response.daily[i].temp.day,
                humidity: response.daily[i].humidity,
            };

            let currentDate = moment.unix(cityInfo.date).format('MM/DD/YYYY');
            let iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${response.daily[i].weather[0].main}">`;

            let futureCardBlock = `
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `;

            $('#fiveDay').append(futureCardBlock);
        }
    });
}

// Add event listeners
$(document).ready(() => {
    let searchHistory = JSON.parse(localStorage.getItem('city'));

    if (searchHistory !== null) {
        let lastSearchedIndex = searchHistory.length - 1;
        let lastSearchedCity = searchHistory[lastSearchedIndex];
        getCurrentCondition(lastSearchedCity);
    }
});

$(document).on('click', '.list-group-item', (event) => {
    let city = event.target.textContent;
    getCurrentCondition(city);
});

$('#searchBtn').on('click', (event) => {
    event.preventDefault();
    let city = $('#enterCity').val().trim();

    getCurrentCondition(city);

    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        let searchedCity = `<li class="list-group-item">${city}</li/>`;
        $('#searchHistory').append(searchedCity);
    };
    
    localStorage.setItem('city', JSON.stringify(searchHistoryList));
});