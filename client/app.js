const { app, BrowserWindow } = require('electron')
const { ClientRequest } = require('http')
const path = require('path')
const { Client } = require('./assets/js/client');
const { IPCMain } = require('./assets/js/ipcMain');
const client = Client.GetInstance();


IPCMain.Create();
client.connect("localhost", 42069, 42031);

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
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

