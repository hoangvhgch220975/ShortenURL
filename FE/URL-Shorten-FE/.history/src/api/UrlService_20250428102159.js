//// src/js/urlService.js
//import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5006';

//const api = axios.create({
//  baseURL: API_BASE_URL,
//  headers: { 'Content-Type': 'application/json' }
//});

//// 1) Request interceptor: gắn access token
//api.interceptors.request.use(config => {
//  const token = localStorage.getItem('jwt_token');
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//  return config;
//});

//// 2) Response interceptor: tự động refresh khi 401
//let isRefreshing = false;
//let failedQueue = [];

//const processQueue = (error, token = null) => {
//  failedQueue.forEach(prom => {
//    if (error) prom.reject(error);
//    else prom.resolve(token);
//  });
//  failedQueue = [];
//};

//api.interceptors.response.use(
//  response => response,
//  error => {
//    const originalRequest = error.config;

//    // nếu 401 và chưa retry lần nào
//    if (error.response?.status === 401 && !originalRequest._retry) {
//      if (isRefreshing) {
//        // chờ khi refresh đang chạy
//        return new Promise((resolve, reject) => {
//          failedQueue.push({ resolve, reject });
//        }).then(token => {
//          originalRequest.headers.Authorization = `Bearer ${token}`;
//          return api(originalRequest);
//        });
//      }

//      originalRequest._retry = true;
//      isRefreshing = true;

//      const refreshToken = localStorage.getItem('refresh_token');
//      if (!refreshToken) {
//        localStorage.clear();
//        return Promise.reject(error);
//      }

//      // gọi refresh endpoint
//      return axios
//        .post(`${API_BASE_URL}/api/auth/refresh-token`, { refreshToken })
//        .then(({ data }) => {
//          if (data.status !== 'success') {
//            throw new Error('Refresh failed');
//          }

//          const newAccessToken = data.data.accessToken;
//          localStorage.setItem('jwt_token', newAccessToken);

//          api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
//          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//          processQueue(null, newAccessToken);
//          return api(originalRequest);
//        })
//        .catch(err => {
//          processQueue(err, null);
//          localStorage.clear();
//          return Promise.reject(err);
//        })
//        .finally(() => {
//          isRefreshing = false;
//        });
//    }

//    return Promise.reject(error);
//  }
//);

//// Kiểm tra token
//const checkTokenValidity = async () => {
//  try {
//    await api.get('/api/auth/check-token');
//    return true;
//  } catch (err) {
//    console.error('Token validation error:', err);
//    localStorage.removeItem('jwt_token');
//    localStorage.removeItem('refresh_token');
//    localStorage.removeItem('isLoggedIn');
//    localStorage.removeItem('user');
//    return false;
//  }
//};

//// Logout
//const logout = async () => {
//  try {
//    await api.post('/api/auth/logout');
//  } catch (err) {
//    console.warn('Logout API error (ignored):', err);
//  } finally {
//    localStorage.clear();
//  }
//};

//// Shorten URL
//const shortenUrl = async (url, customAlias = null) => {
//  const body = { url };
//  if (customAlias) body.customAlias = customAlias;
//  const res = await api.post('/api/url/shorten', body);
//  return res.data;
//};

//// Lấy danh sách URL của user
//const getUserUrls = async () => {
//  const res = await api.get('/api/url/list');
//  return res.data;
//};

//// Xóa URL theo alias (rút từ full shortUrl)
//const deleteUrl = async (shortUrl) => {
//  if (!shortUrl) throw new Error('Missing shortUrl');

//  const alias = shortUrl.split('/').pop();

//  const res = await api.delete(`/api/url/${alias}`);
//  return res.data;
//};



//export default {
//  checkTokenValidity,
//  logout,
//  shortenUrl,
//  getUserUrls,
//  deleteUrl
//};


// src/api/urlService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5006'; // URL of the API Gateway

const api = axios.create({
  baseURL: API_BASE_URL,
  // No need to manually set Content-Type here; FormData will handle it automatically
});

// 1) Request interceptor: attach access token (Keep this)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, don't manually set Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// 2) Response interceptor: auto-refresh token on 401 (Keep this)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];Sjote
};

api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error("No refresh token available.");
        localStorage.clear(); // Clear login information
        processQueue(new Error("No refresh token"), null);
        return Promise.reject(error);
      }

      const refreshApi = axios.create({ baseURL: API_BASE_URL });
      return refreshApi
        .post('/api/auth/refresh-token', { refreshToken })
        .then(({ data }) => {
          if (data.status !== 'success' || !data.data?.accessToken) {
            throw new Error(data.message || 'Invalid refresh token response.');
          }

          const newAccessToken = data.data.accessToken;
          localStorage.setItem('jwt_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        })
        .catch(err => {
          console.error('Failed to refresh token:', err);
          processQueue(err, null);
          localStorage.clear();
          return Promise.reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    return Promise.reject(error);
  }
);

// --- Existing functions (checkTokenValidity, logout, shortenUrl, getUserUrls, deleteUrl) ---

const checkTokenValidity = async () => {
  try {
    await api.get('/api/auth/check-token'); 
    return true;
  } catch (err) {
    console.error('Token validation error:', err);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    return false;
  }
};

const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (err) {
    console.warn('Logout API error (ignored):', err);
  } finally {
    localStorage.clear();
  }
};

const shortenUrl = async (url, customAlias = null) => {
  const body = { url };
  if (customAlias) body.customAlias = customAlias;
  const res = await api.post('/api/url/shorten', body);
  return res.data;
};

const getUserUrls = async () => {
  const res = await api.get('/api/url/list');
  return res.data;
};

const deleteUrl = async (shortUrl) => {
  if (!shortUrl) throw new Error('Missing shortUrl');
  const alias = shortUrl.split('/').pop();
  if (!alias) throw new Error('Invalid shortUrl format');
  const res = await api.delete(`/api/url/${alias}`);
  return res.data;
};

// --- NEW FUNCTION for OCR ---
const uploadImageForOcr = async (imageFile) => {
  if (!imageFile) throw new Error('No image file provided.');

  const formData = new FormData();
  formData.append('file', imageFile); // 'file' must match the backend's expected field name

  try {
    const res = await api.post('/api/ocr/upload', formData);
    return res.data; // Return the JSON response (including originalUrl + shortUrl)
  } catch (error) {
    console.error('Error uploading image for OCR:', error);
    throw error;
  }
};

export default {
  checkTokenValidity,
  logout,
  shortenUrl,
  getUserUrls,
  deleteUrl,
  uploadImageForOcr,
};
