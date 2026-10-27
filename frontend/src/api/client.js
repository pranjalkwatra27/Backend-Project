// Centralized API client fetch wrapper

const API_BASE = '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token =
    localStorage.getItem('candidex_token') ||
    localStorage.getItem('kuvora_token') ||
    localStorage.getItem('talentpulse_token');

  const headers = {
    ...options.headers,
  };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // If unauthorized or deactivated, trigger clean handling
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token might be expired
      // Do not clear immediately on login failure
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
