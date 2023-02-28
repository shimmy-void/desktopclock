const {app, BrowserWindow, Menu, ipcMain, net} = require('electron');
const isMac = process.platform === 'darwin';
const path = require('path');
let fs = require('fs');
let apiKeys;
const filename = 'api_keys.json';
let contents = fs.readFileSync(filename, 'utf8');
apiKeys = JSON.parse(contents);
process.env.GOOGLE_API_KEY = apiKeys.geolocation;

function handleFileExists(event, filename) {
  return fs.existsSync(filename);
}

async function handleFileAppend(event, filename, name, email) {
  return await fs.appendFile(filename, name + ',' + email + '\n', (err) => {
    if (err) console.log(err);
  });
}

function handleFileRead(event, filename) {
  return fs.readFileSync(filename, 'utf8');
}

async function handleFileCreate(event, filename) {
  return await fs.writeFile(filename, '', (err) => {
    if (err) console.log(err);
  });
}

async function handleFileWrite(event, filename, data) {
  return await fs.writeFile(filename, data, (err) => {
    if (err) console.log(err);
  });
}

async function getRequest(requestUri) {
  const request = net.request(requestUri);

  let promise = new Promise(function(resolve, reject) {
    let data = '';

    request.on('response', (response) => {
      // console.log(`STATUS: ${response.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
      response.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`);
        data += chunk;
      });
      response.on('end', () => {
        // console.log('No more data in response.');
        // console.log(`data: ${data}`);
        resolve(data);
      });
    })
    request.end();
  
  });
  return await promise;
}

function handleGetApiKeys(event) {
  return apiKeys;
}

async function handleGetNewsSources(event, apiKey) {
  let requestUri = `https://newsapi.org/v2/top-headlines/sources?apiKey=${apiKey}`;
  console.log(`Request: ${requestUri}`);

  return await getRequest(requestUri);
}

async function handleGetHeadlines(event, apiKey, country, category, sources) {
  let requestUri = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;
  if (sources) {
    requestUri += `&sources=${sources}`;
  } else { 
    if (country) requestUri += `&country=${country}`;
    if (category) requestUri += `&category=${category}`;
  }
  console.log(`Request: ${requestUri}`);

  return await getRequest(requestUri);
}

async function handleGetCurrentWeather(event, apiKey, lat, lon, units, lang) {
  let requestUri = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  if (units) requestUri += `&units=${units}`;
  if (lang) requestUri += `&lang=${lang}`;
  console.log(`Request: ${requestUri}`);

  return await getRequest(requestUri);
}

async function handleGetForecast(event, apiKey, lat, lon, units, lang) {
  let requestUri = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  if (units) requestUri += `&units=${units}`;
  if (lang) requestUri += `&lang=${lang}`;
  console.log(`Request: ${requestUri}`);

  return await getRequest(requestUri);
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const menu = Menu.buildFromTemplate([
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      {
        click: () => {
          mainWindow.setFullScreen(true);
          mainWindow.setMenuBarVisibility(false);
        },
        label: 'Full screen',
        accelerator: 'CommandOrControl+F',
      },
      {
        click: () => {
          mainWindow.setFullScreen(false);
          mainWindow.setMenuBarVisibility(true);
        },
        label: 'Show menu',
        accelerator: 'Esc',
        visible: false
      }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
  ])

  Menu.setApplicationMenu(menu)
  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  ipcMain.handle('fs:exists', handleFileExists);
  ipcMain.handle('fs:append', handleFileAppend);
  ipcMain.handle('fs:read', handleFileRead);
  ipcMain.handle('fs:create', handleFileCreate);
  ipcMain.handle('fs:write', handleFileWrite);
  ipcMain.handle('apikeys:get', handleGetApiKeys);
  ipcMain.handle('news:getsources', handleGetNewsSources);
  ipcMain.handle('news:get', handleGetHeadlines);
  ipcMain.handle('weather:getcurrent', handleGetCurrentWeather);
  ipcMain.handle('weather:getforecast', handleGetForecast);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})
