// electron/preload.ts
var import_electron = require("electron");
var API_PORT = process.env.PORT || "3000";
var API_URL = `http://127.0.0.1:${API_PORT}`;
try {
  import_electron.contextBridge.exposeInMainWorld("electronAPI", {
    apiUrl: API_URL,
    isElectron: true
  });
} catch {
  window.__API_URL__ = API_URL;
}
