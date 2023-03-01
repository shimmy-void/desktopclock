# Desktop Clock

![Top image of desktop clock](/docs/img/top.png)

## What is this?

An desktop application to display a clock with news headlines and weather forecasts for small displays (e.g. resolution of 800 x 640). This app is developed using [Electron](https://www.electronjs.org/) framework and web APIs of [News API](https://newsapi.org/) and [OpenWeather](https://openweathermap.org/).

## Features

- Displays current time as well as current weather and temperature on your location.
- Displays news headline delivered from News API.
- Displays 3-hour step weather and temperature forecasts for 24 hours.
- The country and category, or source for the news feed can be changed as News API supports.
- Units of temperatures can be changed to Kelvin (K), Fahrenheit (°F), or Celcius (°C).
- Uses free plan API keys of Google, News API, and OpenWeather to acquire geolocation, news feed, and weather forecast data.

## Prerequisites

- Install [Node.js](https://nodejs.org/en/) to use Electron framework.
- Acquire API keys from the following web service provides:
    - [Google](https://developers.google.com/maps/documentation/geolocation/get-api-key)
    - [News API](https://newsapi.org/register)
    - [OpenWeather](https://home.openweathermap.org/users/sign_up) 

## How to install

1. Clone this repository on a directory.

```shell
    git clone https://github.com/shimmy-void/desktopclock.git
```

2. Install Electron framework on the directory.

```shell
    cd desktopclock
    npm i -D electron
```

3. Make the `api_keys.json` file with your API keys acquired in [Prerequisites](#Prerequisites) and save it on the same directory (desktopclock).

```json
{
  "geolocation": "<YOUR_GOOGLE_APIKEY>",
  "news": "<YOUR_NEWSAPI_APIKEY>",
  "weather": "<YOUT_OPENWEATHER_APIKEY>"
}
```

## Usage

To start the application, type the following command:

```shell
  npm start
```

That is done!

### Config setting

If you want to change settings like news fed country, category, or source, click the button attacked on the left of the display.

![config button](/docs/img/config_btn.png)

It shows the config menu like the following:

![config menu](/docs/img/config.png)

On this panel, you can change how the News API feeds and which temperature unit is used.

> You can set the news feed type to either of "country & category" or "source" due to the specification of the News API.

The config settings are stored in `config.json`, you can also change the settings manually by editting the file.

### Full screen mode

This application can hide top menu bar and the title by clicking `View->Full screen` button or using shortcut key: `Ctrl+F`.

> To finish the full screen mode, Push `Esc`.

![full screen button](/docs/img/fullscreen.png)

## Limitations

Due to the specification of web APIs with free plan, only restriced numbers of API requests are allowed.

### Google (geolocation)
- 40,000 requests per month within Google's $200 no charge service, but Google is adopting pay-as-you-go pricing model, see [Google geolocation billing page](https://developers.google.com/maps/documentation/geolocation/usage-and-billing).

### News API
- 100 requests per day
- Articles with 24 hour delay

### OpenWeather
- 60 requests per minute
- 1,000,000 requests per month ( = 32,258 requests per day, 1,344 requests per hour, or 22 requests per minute )

This application makes API requests as follows:

### Google (geolocation)
- Only once during startup

### News API
- 1 request per every 15 minutes
- 1 request when closing the config menu

### Openweather
- 1 request per every 15 minutes for the current weather
- 1 request per hour for the forecast
- 2 requests when closing the config menu

If you want to make more requests past the above limitations, upgrade your each API's plan to higher ones or just stop the application and wait until the restrictions are alleviated.

## Dependency

- Node.js v18.14.2
- npm 9.5.1
- Electron 23.1.1
- [News API](https://newsapi.org/)
- [OpenWeather](https://openweathermap.org/)
