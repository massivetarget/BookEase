const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false, // Allow loading from localhost
        },
    });

    // Try to load from dev server first, fall back to production build
    const devServerUrl = 'http://localhost:8081';
    const prodPath = path.join(__dirname, '../dist/index.html');

    // Try dev server first
    win.loadURL(devServerUrl).catch(() => {
        console.log('Dev server not available, trying production build...');
        win.loadFile(prodPath).catch((err) => {
            console.error('Failed to load app:', err);
            console.log('\nPlease either:');
            console.log('1. Start the dev server: npm run web');
            console.log('2. Build for production: npx expo export -p web');
        });
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
