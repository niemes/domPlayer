// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

const titleBarStyle = (process.platform === 'darwin') ? 'hiddenInset' : 'default';
const frameWin = (process.platform === 'darwin') ? false : true;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarStyle: titleBarStyle,
    autoHideMenuBar: true,
    vibrancy: 'dark',
    width: 640,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    show: true,
    skipTaskbar: true,
    transparent: false,
    frame: frameWin,
    fullScreenable: true,
    resizable: true,
    backgroundColor: "black", //background,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: false,
      // nodeIntegration: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('dialog', (event, method, params) => {       
    return dialog[method](params);
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
