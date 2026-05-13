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

const API_BASE_URL = 'http://localhost:5006'; // URL của API Gateway

const api = axios.create({
  baseURL: API_BASE_URL,
  // Không cần set Content-Type ở đây vì FormData sẽ tự xử lý
});

// 1) Request interceptor: gắn access token (Giữ nguyên)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Khi gửi FormData, không nên đặt Content-Type thủ công
  // Axios sẽ tự đặt đúng Content-Type (multipart/form-data) cùng với boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// 2) Response interceptor: tự động refresh khi 401 (Giữ nguyên)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
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
          return api(originalRequest); // Quan trọng: gọi lại bằng instance `api`
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Xử lý khi không có refresh token (ví dụ: logout, chuyển hướng login)
        console.error("No refresh token available.");
        localStorage.clear(); // Xóa hết thông tin đăng nhập
        // Có thể thêm logic chuyển hướng trang login ở đây
        processQueue(new Error("No refresh token"), null);
        return Promise.reject(error);
      }

      // Tạo instance axios mới CHỈ để gọi refresh token, tránh vòng lặp interceptor
      const refreshApi = axios.create({ baseURL: API_BASE_URL });
      return refreshApi
        .post('/api/auth/refresh-token', { refreshToken })
        .then(({ data }) => {
          if (data.status !== 'success' || !data.data?.accessToken) {
            // Ném lỗi cụ thể hơn
            throw new Error(data.message || 'Refresh token failed, response invalid.');
          }

          const newAccessToken = data.data.accessToken;
          localStorage.setItem('jwt_token', newAccessToken);

// Cập nhật header mặc định cho các request sau này (tùy chọn)
// api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          // Quan trọng: Cập nhật header cho request gốc bị lỗi 401
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest); // Gọi lại request gốc bằng instance `api` đã có interceptor
        })
        .catch(err => {
          console.error('Failed to refresh token:', err);
          processQueue(err, null);
          // Xóa thông tin đăng nhập cũ nếu refresh thất bại
          localStorage.clear();
          // Có thể thêm logic chuyển hướng trang login ở đây
          return Promise.reject(err); // Ném lỗi ra ngoài
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // Nếu lỗi không phải 401 hoặc đã retry, ném lỗi ra ngoài
    return Promise.reject(error);
  }
);


// --- Các hàm hiện có (checkTokenValidity, logout, shortenUrl, getUserUrls, deleteUrl) ---
// Giữ nguyên các hàm này...

const checkTokenValidity = async () => {
  try {
    await api.get('/api/auth/check-token'); // Hoặc /api/auth/validate tùy endpoint bạn muốn
    return true;
  } catch (err) {
    console.error('Token validation error:', err);
    // Xóa token nếu không hợp lệ (interceptor có thể đã làm nhưng clear ở đây chắc chắn hơn)
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    return false;
  }
};

const logout = async () => {
  try {
    // Gọi API logout không quá quan trọng, chủ yếu là xóa local storage
    await api.post('/api/auth/logout');
  } catch (err) {
    // Bỏ qua lỗi từ API logout vì client vẫn sẽ xóa token
    console.warn('Logout API error (ignored):', err);
  } finally {
    localStorage.clear();
    // Thêm logic chuyển hướng về trang login nếu cần
  }
};

const shortenUrl = async (url, customAlias = null) => {
  const body = { url };
  if (customAlias) body.customAlias = customAlias;
  // Giả định endpoint này cần xác thực
  const res = await api.post('/api/url/shorten', body);
  return res.data; // Nên trả về toàn bộ data để FE lấy shortUrl
};

const getUserUrls = async () => {
  // Giả định endpoint này cần xác thực
  const res = await api.get('/api/url/list');
  return res.data; // res.data đã là array các URL
};

const deleteUrl = async (shortUrl) => {
  if (!shortUrl) throw new Error('Missing shortUrl');
  const alias = shortUrl.split('/').pop();
  if (!alias) throw new Error('Invalid shortUrl format');
  // Giả định endpoint này cần xác thực
  const res = await api.delete(`/api/url/${alias}`);
  return res.data;
};


// --- HÀM MỚI CHO OCR ---
const uploadImageForOcr = async (imageFile) => {
  if (!imageFile) throw new Error('No image file provided.');

  const formData = new FormData();
  formData.append('file', imageFile); // 'file' là key gửi lên server, backend phải đọc từ req.file hoặc req.files.file

  try {
    const res = await api.post('/api/ocr/upload', formData);
    // Giả sử API nhận form-data ở endpoint này
    return res.data; // Trả kết quả JSON (gồm originalUrl + shortUrl)
  } catch (error) {
    console.error('Error uploading image for OCR:', error);
    throw error; // ném lỗi để component gọi upload xử lý
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

