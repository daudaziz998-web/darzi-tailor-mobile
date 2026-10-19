// electron/main.ts
import { app, BrowserWindow, shell } from "electron";
import path from "path";
import fs from "fs";
import http from "http";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var mainWindow = null;
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
if (!isDev) {
  process.env.NODE_ENV = "production";
  process.env.ELECTRON_PRODUCTION = "true";
}
function configureUserDataPath() {
  try {
    const userDataPath = app.getPath("userData");
    process.env.USER_DATA_PATH = userDataPath;
    console.log(`[Electron] Persistent UserData path configured at: ${userDataPath}`);
  } catch (err) {
    console.error("[Electron] Failed to obtain app userData path:", err);
  }
}
async function startBackendServer() {
  try {
    console.log("[Electron] Initializing backend Express server...");
    await import("./server.js");
    console.log("[Electron] Backend Express server started successfully.");
  } catch (err) {
    console.error("[Electron] Error starting backend Express server:", err);
    throw err;
  }
}
function waitForBackendReady(port, timeoutMs = 15e3) {
  const startTime = Date.now();
  console.log(`[Electron] Waiting for backend server readiness on port ${port}...`);
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}/api/db-info`, (res) => {
        if (res.statusCode === 200) {
          console.log("[Electron] Backend server is ready and responding.");
          resolve(true);
        } else {
          scheduleRetry();
        }
      });
      req.on("error", () => {
        scheduleRetry();
      });
      req.setTimeout(1e3, () => {
        req.destroy();
        scheduleRetry();
      });
    };
    const scheduleRetry = () => {
      if (Date.now() - startTime > timeoutMs) {
        console.warn(`[Electron] Backend server readiness check timed out after ${timeoutMs}ms.`);
        resolve(false);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}
function getProductionDistIndexPath() {
  const candidatePaths = [
    path.join(app.getAppPath(), "dist", "index.html"),
    path.join(__dirname, "..", "dist", "index.html"),
    path.join(__dirname, "dist", "index.html"),
    path.join(process.resourcesPath || "", "app", "dist", "index.html"),
    path.join(process.resourcesPath || "", "app.asar", "dist", "index.html")
  ];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return "";
}
function showStartupErrorScreen(win, title, details) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Awais Tailor House - Startup Notice</title>
        <style>
          body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 32px;
            max-width: 560px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          h2 { color: #f87171; margin-top: 0; font-size: 22px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .details {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 12px;
            font-family: monospace;
            font-size: 12px;
            color: #cbd5e1;
            margin: 16px 0;
            text-align: left;
            word-break: break-all;
            max-height: 140px;
            overflow-y: auto;
          }
          button {
            background: #d97706;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover { background: #b45309; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>${title}</h2>
          <p>An unexpected condition occurred while launching the desktop application. Please check the information below:</p>
          <div class="details">${details}</div>
          <button onclick="window.location.reload()">Reload Application</button>
        </div>
      </body>
    </html>
  `;
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}
function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  const hasPreload = fs.existsSync(preloadPath);
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 650,
    title: "Awais Tailor House - Talash, Shamshi Khan",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: hasPreload ? preloadPath : void 0
    },
    autoHideMenuBar: true,
    show: false,
    // Prevent white flash before content is rendered
    backgroundColor: "#0f172a"
  });
  mainWindow.maximize();
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
    console.error("[Electron] Renderer failed to load:", {
      errorCode,
      errorDescription,
      validatedURL
    });
    if (mainWindow && !mainWindow.isDestroyed()) {
      showStartupErrorScreen(
        mainWindow,
        "Application Loading Issue",
        `Error code: ${errorCode}<br>Description: ${errorDescription}<br>Target URL: ${validatedURL}`
      );
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (isDev) {
    const devUrl = `http://127.0.0.1:${PORT}`;
    console.log(`[Electron] Development mode: loading URL ${devUrl}`);
    mainWindow.loadURL(devUrl).catch((err) => {
      console.error("[Electron] Failed to load development URL:", err);
      if (mainWindow) {
        showStartupErrorScreen(
          mainWindow,
          "Development Server Not Found",
          `Could not connect to ${devUrl}. Please ensure server is running.`
        );
      }
    });
  } else {
    const distIndexPath = getProductionDistIndexPath();
    if (distIndexPath) {
      console.log(`[Electron] Production mode: loading compiled frontend from ${distIndexPath}`);
      mainWindow.loadFile(distIndexPath).catch((err) => {
        console.error("[Electron] Failed to loadfile dist/index.html:", err);
        mainWindow?.loadURL(`http://127.0.0.1:${PORT}`).catch((fallbackErr) => {
          console.error("[Electron] Fallback to localhost failed:", fallbackErr);
          if (mainWindow) {
            showStartupErrorScreen(
              mainWindow,
              "Application Launch Error",
              `Could not load application files: ${err.message}`
            );
          }
        });
      });
    } else {
      console.warn("[Electron] dist/index.html not found, attempting local server fallback...");
      mainWindow.loadURL(`http://127.0.0.1:${PORT}`).catch((err) => {
        console.error("[Electron] Local server fallback failed:", err);
        if (mainWindow) {
          showStartupErrorScreen(
            mainWindow,
            "Missing Production Assets",
            "Could not find dist/index.html in the application package."
          );
        }
      });
    }
  }
}
var gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(async () => {
    configureUserDataPath();
    try {
      await startBackendServer();
      await waitForBackendReady(PORT, 15e3);
    } catch (err) {
      console.error("[Electron] Error during backend initialization:", err);
    }
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
