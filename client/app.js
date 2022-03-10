const { app, BrowserWindow } = require('electron')
const { ClientRequest } = require('http')
const path = require('path')
const { Client } = require('./assets/js/client');
const { IPCMain } = require('./assets/js/ipcMain');


IPCMain.Create();

function createWindow () {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html')
  win.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

