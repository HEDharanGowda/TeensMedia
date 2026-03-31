
// Use relative paths for production deployment
const fallbackApi = '/api';
const fallbackSocket = '/';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || fallbackApi;
}

export function getSocketBaseUrl() {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || fallbackSocket;
}
