const elemHrMin = document.getElementById('disp-hrmin');
const elemSec = document.getElementById('disp-sec');
const elemDay = document.getElementById('disp-day');
const elemContainer = document.getElementById('headline-container');
const elemHeadline = document.getElementById('headline');
const elemCurrentIcon = document.getElementById('current-icon');
const elemCurrentTemp = document.getElementById('current-temp');
const elemForecastHeaderTemp = document.getElementById('forecast-temp');
const elemBtnNavOpen = document.getElementById('btn-navopen');
const elemBtnNavClose = document.getElementById('btn-navclose');

const filename = 'config.json';
let config;
let apiKeys;

const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const month_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const categoryList = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const countryListShort = ['ar', 'au', 'at', 'be', 'br', 'bg', 'ca', 'cn', 'co', 'cu', 'cz', 'eg', 'fr', 'de', 'gr', 'hk', 'hu', 'in', 'id', 'ie', 'il', 'it', 'jp', 'lv', 'lt',
                          'my', 'mx', 'ma', 'nl', 'nz', 'ng', 'no', 'ph', 'pl', 'pt', 'ro', 'ru', 'sa', 'rs', 'sg', 'sk', 'si', 'za', 'kr', 'se', 'ch', 'tw', 'th', 'tr', 'ae',
                          'ua', 'gb', 'us', 've'];
const countryListLong = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China', 'Colombia', 'Cuba', 'Czech Republic', 'Egypt', 'France',
                         'Germany', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Latvia', 'Lithuania', 'Malaysia', 'Mexico',
                         'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia',
                         'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'UAE', 'Ukraine',
                         'United Kingdom', 'United States', 'Venuzuela'];
const langListShort =  ['af', 'al', 'ar', 'az', 'bg', 'ca', 'cz', 'da', 'de', 'el', 'en', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kr', 'la',
                        'lt', 'mk', 'no', 'nl', 'pl', 'pt', 'pt_br', 'ro', 'ru', 'sv', 'sk', 'sl', 'sp', 'sr', 'th', 'tr', 'ua', 'vi', 'zh_cn', 'zh_tw', 'zu'];
const langListLong = ['Afrikaans', 'Albanian', 'Arabic', 'Azerbaijani', 'Bulgarian', 'Catalan', 'Czech', 'Danish', 'German', 'Greek', 'English', 'Basque', 'Persian (Farsi)',
                      'Finnish', 'French', 'Galician', 'Hebrew', 'Hindi', 'Croatian', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian',
                      'Macedonian', 'Norwegian', 'Dutch', 'Polish', 'Portguese', 'Português Brasil', 'Romanian', 'Russian', 'Swedish', 'Slovak', 'Slovenian', 'Spanish',
                      'Serbian', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese', 'Chinese Simplified', 'Chinese Traditional', 'Zulu'];
let sourceList = [];
const widthContainer = 800;
let strHeadline = '';
let tempUnit;

function setTempUnit() {
  if (config.weather.units === "standard") {
    tempUnit = "K";
  } else if (config.weather.units === "metric") {
    tempUnit = "&#8451;";
  } else {
    tempUnit = "&#8457;";
  }
  elemForecastHeaderTemp.innerHTML = "Temp [" + tempUnit + "]"; 
}

// Load or create config file
async function loadConfig() {
  if (await window.electronAPI.fileExists(filename)) {
    console.log(`Found config file: ${filename}`);
    let contents = await window.electronAPI.fileRead(filename);
    config = JSON.parse(contents);
  } else {
    console.log(`File Doesn\'t Exist. Creating a new file: ${filename}`);
    await window.electronAPI.fileCreate(filename);
  }
  apiKeys = await window.electronAPI.getApiKeys();
  setTempUnit();
}

// Add zeros strings on a number
function addZero(i) {
  if (i < 10) {i = '0' + i;}
  return i;
}

let articles = 0;
let articleNum = 0;
let objArticles;
let txtWidth;

let latitude;
let longitude;

function displayTextWidth(text, font) {
  let canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement('canvas'));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}

async function getNewsSources() {
  const resData = await window.electronAPI.getNewsSources(apiKeys.news);
  objSources = JSON.parse(resData);
  for (let i = 0; i < objSources.sources.length; i++) {
    sourceList[i] = objSources.sources[i].id;
  }
}

async function updateHeadlines() {
  const resData = await window.electronAPI.getHeadlines(apiKeys.news, config.news.country, config.news.category, config.news.sources);
  objArticles = JSON.parse(resData);
  console.log(objArticles);
  articles = objArticles.articles.length;
}

function changeArticle() {
  const strArticle = `${objArticles.articles[articleNum].source.name}: ${objArticles.articles[articleNum].title}`;
  txtWidth = Math.ceil(displayTextWidth(strArticle, "40pt Helvetica, Arial, sans-serif"));
  elemHeadline.style.width = txtWidth + "px";
  elemHeadline.innerHTML = strArticle;
  if (articleNum === (articles - 1)) {
    articleNum = 0;
  } else {
    articleNum++;
  }
}

function moveHeadline() {
  let id = null;
  let pos = widthContainer;

  changeArticle();
  clearInterval(id);
  id = setInterval(frame, 10);
  function frame() {
    if (pos == (-1 * txtWidth)) {
      changeArticle();
      pos = widthContainer;
    } else {
      pos--;
      elemHeadline.style.transform = `translateX(${pos}px)`;
    }
  }
}

async function getCurrentWeather() {
  let promise = new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(putWeather, (err) => {
      navigator.geolocation.getCurrentPosition(dispWeather, (err) => {
        if (err) console.log(err);
        reject();
      });
      resolve();
    } else {
      console.log('Geolocation is not supported by this browser.');
      reject();
    }
  
  });
  return await promise;
}

// For debug use
async function putWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const resData = await window.electronAPI.getCurrentWeather(apiKeys.weather, lat, lon, config.weather.units, config.weather.lang);
  const objCurrentWeather = JSON.parse(resData);
  console.log(objCurrentWeather);
}

async function dispWeather(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const resData = await window.electronAPI.getCurrentWeather(apiKeys.weather, lat, lon, config.weather.units, config.weather.lang);
  const objCurrentWeather = JSON.parse(resData);
  console.log(`You are in ${objCurrentWeather.name}, (lon, lat) = (${objCurrentWeather.coord.lon}, ${objCurrentWeather.coord.lat}).`);
  elemCurrentIcon.src = `./images/${objCurrentWeather.weather[0].icon}@2x.png`;
  elemCurrentTemp.innerHTML = `${objCurrentWeather.main.temp.toFixed(1)} ${tempUnit}`;
}

async function getForecast() {
  let promise = new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(putForecast, (err) => {
        navigator.geolocation.getCurrentPosition(dispForecast, (err) => {
        if (err) console.log(err);
        reject();
      });
      resolve();
    } else {
      console.log('Geolocation is not supported by this browser.');
      reject();
    }
  
  });
  return await promise;
}

// For debug use
async function putForecast(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const resData = await window.electronAPI.getForecast(apiKeys.weather, lat, lon, config.weather.units, config.weather.lang);
  const objForecast = JSON.parse(resData);
  console.log(objForecast);
}

async function dispForecast(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const resData = await window.electronAPI.getForecast(apiKeys.weather, lat, lon, config.weather.units, config.weather.lang);
  const objForecast = JSON.parse(resData);
  let dates_temp;

  for (let i = 0; i < 8; i++ ) {
    const elemForecastDay = document.getElementById(`forecast-day${i}`);
    const elemForecastTime = document.getElementById(`forecast-time${i}`);
    const elemForecastIcon = document.getElementById(`forecast-icon${i}`);
    const elemForecastTemp = document.getElementById(`forecast-temp${i}`);
    const dt = new Date(objForecast.list[i].dt*1000);
    const hours = addZero(dt.getHours());
    const minutes = addZero(dt.getMinutes());
    const dates = addZero(dt.getDate());

    if (dates_temp !== dates) {
      dates_temp = dates;
      colspan = 1;
      elemForecastDay.innerHTML = `${dates} (${weekday[dt.getDay()]})`;
    }

    elemForecastTime.innerHTML = `${hours}`;
    elemForecastIcon.src = `./images/${objForecast.list[i].weather[0].icon}@2x.png`;
    elemForecastTemp.innerHTML = `${objForecast.list[i].main.temp.toFixed(1)}`;
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await getNewsSources();

  await getCurrentWeather();
  await getForecast();
  setInterval(async () => {
    await getCurrentWeather();
  }, 900000);
  setInterval(async () => {
    await getForecast();
  }, 3600000);

  await updateHeadlines();
  setInterval(async () => {
    await updateHeadlines();
  }, 900000);
  moveHeadline();
  setInterval(dispTime, 1000);
});

function dispTime() {
  let ms = Date.now();
  let date = new Date(ms);
  let hours = addZero(date.getHours());
  let minutes = addZero(date.getMinutes());
  let seconds = addZero(date.getSeconds());
  let dates = addZero(date.getDate());

  elemHrMin.innerHTML = `${hours}:${minutes}`;
  elemSec.innerHTML = seconds;
  elemDay.innerHTML = `${dates} ${month[date.getMonth()]}, ${date.getFullYear()} (${weekday[date.getDay()]})`;
}

const elemConfigNewsCountry = document.getElementById("news-country");
const elemConfigNewsCategory = document.getElementById("news-category");
const elemConfigNewsSorce = document.getElementById("news-source");
// const elemConfigWeatherLang = document.getElementById("weather-lang");
const elemConfigNewsQueryCountry = document.querySelector("input[name=news-querytype][id=country]");
const elemConfigNewsQuerySource = document.querySelector("input[name=news-querytype][id=source]");

function drawConfig() {
  if (config.news.sources) {
    elemConfigNewsQuerySource.checked = true;
    elemConfigNewsCountry.disabled = true;
    elemConfigNewsCategory.disabled = true;
    elemConfigNewsSorce.disabled = false;
  } else {
    elemConfigNewsQueryCountry.checked = true;
    elemConfigNewsCountry.disabled = false;
    elemConfigNewsCategory.disabled = false;
    elemConfigNewsSorce.disabled = true;
  }
  for (let i = 0; i < countryListShort.length; i++) {
    const option = document.createElement("option");
    option.setAttribute("value", countryListShort[i]);
    option.innerHTML = countryListLong[i];
    elemConfigNewsCountry.appendChild(option);
  }
  for (let i = 0; i < categoryList.length; i++) {
    const option = document.createElement("option");
    option.setAttribute("value", categoryList[i]);
    option.innerHTML = categoryList[i];
    elemConfigNewsCategory.appendChild(option);
  }
  for (let i = 0; i < sourceList.length; i++) {
    const option = document.createElement("option");
    option.setAttribute("value", sourceList[i]);
    option.innerHTML = sourceList[i];
    elemConfigNewsSorce.appendChild(option);
  }
  // for (let i = 0; i < langListShort.length; i++) {
  //   const option = document.createElement("option");
  //   option.setAttribute("value", langListShort[i]);
  //   option.innerHTML = langListLong[i];
  //   elemConfigWeatherLang.appendChild(option);
  // }
  if (config.news.country) {
    elemConfigNewsCountry.value = config.news.country;
  }
  if (config.news.category) {
    elemConfigNewsCategory.value = config.news.category;
  }
  if (config.news.sources) {
    elemConfigNewsSorce.value = config.news.sources;
  }
  if (config.weather.units) {
    const elemConfigWeatherUnit = document.querySelector("input[name=units][value=" + config.weather.units + "]");
    elemConfigWeatherUnit.checked = true;
  }
  // if (config.weather.lang) {
  //   elemConfigWeatherLang.value = config.weather.lang;
  // }
}

async function getConfig() {
  const countryId = elemConfigNewsCountry.selectedIndex;
  const countryShort = elemConfigNewsCountry.value;
  const countryLong = elemConfigNewsCountry.options[countryId].innerHTML;
  const categoryId = elemConfigNewsCategory.selectedIndex;
  const category = elemConfigNewsCategory.value;
  const sourceId = elemConfigNewsSorce.selectedIndex;
  const source = elemConfigNewsSorce.value;
  // const langId = elemConfigWeatherLang.selectedIndex;
  // const langShort = elemConfigWeatherLang.value;
  // const langLong = elemConfigWeatherLang.options[langId].innerHTML;

  const elemConfigWeatherUnit = document.querySelector("input[name=units]:checked");
  const unit = elemConfigWeatherUnit.value;

  if (elemConfigNewsQueryCountry.checked) {
    config.news.country = countryShort;
    config.news.category = category;
    config.news.sources = '';
  } else {
    config.news.country = '';
    config.news.category = '';
    config.news.sources = source;
  }
  config.weather.units = unit;
  // config.weather.lang = langShort;
  config.weather.lang = 'en';

  await window.electronAPI.fileWrite(filename, JSON.stringify(config));
}

elemBtnNavOpen.addEventListener('click', () => {
  drawConfig();
  document.getElementById('nav').style.width = "100%";
});

elemBtnNavClose.addEventListener('click', async() => {
  getConfig();
  setTempUnit();

  await getCurrentWeather();
  await getForecast();
  await updateHeadlines();

  document.getElementById('nav').style.width = "0%";
});

elemConfigNewsQueryCountry.addEventListener('click', () => {
  elemConfigNewsCountry.disabled = false;
  elemConfigNewsCategory.disabled = false;
  elemConfigNewsSorce.disabled = true;
});

elemConfigNewsQuerySource.addEventListener('click', () => {
  elemConfigNewsCountry.disabled = true;
  elemConfigNewsCategory.disabled = true;
  elemConfigNewsSorce.disabled = false;
});
