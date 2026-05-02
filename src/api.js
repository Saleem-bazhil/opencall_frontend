// Retrieve the base URL from Vite environment variables, falling back to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const ENDPOINTS = {
  OPENCALL_UPLOAD: `${API_BASE_URL}/opencall/upload`,
  OPENCALL_DATA: `${API_BASE_URL}/opencall/data`,
};
