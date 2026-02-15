const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        title: "Eman Bakery 360",
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        // Frameless-ish feel but with standard controls
        backgroundColor: '#0f172a'
    });

    // Remove menu bar for a clean "App" experience
    Menu.setApplicationMenu(null);

    // Load the live Vercel URL
    win.loadURL('https://emanbakeries-official.vercel.app');

    // Open external links in the default browser (e.g., links to GOSI/Qiwa)
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https://emanbakeries-official.vercel.app')) {
            return { action: 'allow' };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Handle errors or offline state
    win.webContents.on('did-fail-load', () => {
        win.loadURL(`data:text/html,
      <body style="background:#0f172a;color:white;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
        <h1 style="color:#4f46e5">Connection Lost</h1>
        <p>Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()" style="padding:10px 20px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Retry Connection</button>
      </body>
    `);
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
