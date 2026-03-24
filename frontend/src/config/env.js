const fallbackApi = 'http://localhost:5000/api';
const fallbackSocket = 'http://localhost:5000';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || fallbackApi;
}

export function getSocketBaseUrl() {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || fallbackSocket;
}
