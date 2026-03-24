import axios from 'axios';
import { getApiBaseUrl } from '../config/env';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

export function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export default api;
