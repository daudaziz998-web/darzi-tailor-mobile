import { contextBridge } from 'electron';

const API_PORT = process.env.PORT || '3000';
const API_URL = `http://127.0.0.1:${API_PORT}`;

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    apiUrl: API_URL,
    isElectron: true,
  });
} catch {
  // If contextIsolation is disabled
  (window as any).__API_URL__ = API_URL;
}
