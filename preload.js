// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const dependency of ['chrome', 'node', 'electron']) {
//     replaceText(`${dependency}-version`, process.versions[dependency])
//   }
// })
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fileExists: (filename) => ipcRenderer.invoke('fs:exists', filename),
  fileAppend: (filename, name, email) => ipcRenderer.invoke('fs:append', filename, name, email),
  fileRead: (filename) => ipcRenderer.invoke('fs:read', filename),
  fileCreate: (filename) => ipcRenderer.invoke('fs:create', filename),
  fileWrite: (filename, data) => ipcRenderer.invoke('fs:write', filename, data),
  getApiKeys: () => ipcRenderer.invoke('apikeys:get'),
  getNewsSources: (apiKey) => ipcRenderer.invoke('news:getsources', apiKey),
  getHeadlines: (apiKey, country, category, sources) => ipcRenderer.invoke('news:get', apiKey, country, category, sources),
  getCurrentWeather: (apiKey, lat, lon, units, lang) => ipcRenderer.invoke('weather:getcurrent', apiKey, lat, lon, units, lang),
  getForecast: (apiKey, lat, lon, units, lang) => ipcRenderer.invoke('weather:getforecast', apiKey, lat, lon, units, lang)
})
