export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    if ((window as any).electronAPI?.apiUrl) {
      return (window as any).electronAPI.apiUrl;
    }
    if ((window as any).__API_URL__) {
      return (window as any).__API_URL__;
    }
    if (window.location && window.location.protocol === 'file:') {
      return 'http://127.0.0.1:3000';
    }
  }
  return '';
};

export const apiFetch = (endpoint: string, init?: RequestInit): Promise<Response> => {
  const base = getApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;
  return fetch(url, init);
};
