import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL_WITH_PROXY = isDevelopment ? "/api" : API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL_WITH_PROXY,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('네트워크 에러:', error);
      return Promise.reject({
        ...error,
        response: { data: { message: '서버 연결 실패', error: 'NETWORK_ERROR' }, status: 0 }
      });
    }
    if (error.response?.status === 404) {
      console.error('API 엔드포인트 없음:', error.config.url);
      return Promise.reject({
        ...error,
        response: { data: { message: 'API 준비되지 않음', error: 'ENDPOINT_NOT_FOUND' }, status: 404 }
      });
    }
    return Promise.reject(error);
  }
);

export const gameAPI = {
  createGame: (gameData) => api.post('/baseball/game', gameData),
  getGame: (gameId) => api.get(`/baseball/game/${gameId}`),
  updateGame: (gameId, gameData) => api.put(`/baseball/game/${gameId}`, gameData),
  endGame: (gameId) => api.post(`/baseball/game/${gameId}/end`),
  getGameHistory: (userId) => api.get(`/baseball/game/history/${userId}`),
};
// 기존 gameAPI 아래에 추가
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
 // --------- 투구/스윙 API 추가 ----------
 pitch: ({ gameId, team }) => api.post(`/baseball/game/${gameId}/pitch`, { team }),
 swing: ({ gameId, team, power }) => api.post(`/baseball/game/${gameId}/swing`, { team, power }),
};


export const boardAPI = {
  getPosts: (params) => api.get('/board', { params }),
  getPost: (id) => api.get(`/board/${id}`),
  createPost: (postData) => api.post('/board', postData),
  updatePost: (id, postData) => api.put(`/board/${id}`, postData),
  deletePost: (id) => api.delete(`/board/${id}`),
};

export default api;
