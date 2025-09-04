// src/api/api.js
import axios from "axios";

// --------- 기본 Axios 인스턴스 설정 ----------
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL_WITH_PROXY = isDevelopment ? "/api" : API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL_WITH_PROXY,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
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

// --------- 게임 API ----------
export const gameAPI = {
  createGame: (gameData) => api.post('/baseball/game', gameData),
  getGame: (gameId) => api.get(`/baseball/game/${gameId}`),
  updateGame: (gameId, gameData) => api.put(`/baseball/game/${gameId}`, gameData),
  endGame: (gameId) => api.post(`/baseball/game/${gameId}/end`),
  getGameHistory: (userId) => api.get(`/baseball/game/history/${userId}`),
  pitch: (gameId, data) => api.post(`/baseball/game/${gameId}/pitch`, data),
  swing: (gameId, data) => api.post(`/baseball/game/${gameId}/swing`, data),
};

// --------- 인증 API ----------
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// --------- 게시판 API ----------
export const boardAPI = {
  getPosts: (params) => api.get('/board', { params }),
  getPost: (id) => api.get(`/board/${id}`),
  createPost: (postData) => api.post('/board', postData),
  updatePost: (id, postData) => api.put(`/board/${id}`, postData),
  deletePost: (id) => api.delete(`/board/${id}`),
};

// --------- 선수 API ----------
export const playerAPI = {
  /**
   * 팀별 선수 목록 조회
   * @param {string} teamName
   * @returns Axios Promise
   */
  getTeamPlayers: (teamName) => 
    axios.get(`http://localhost:8080/api/team/${encodeURIComponent(teamName)}/players`),

  /**
   * 팀별 전체 로스터 조회 (타자+투수)
   * @param {string} teamName
   * @returns Axios Promise 
   */
  getTeamRoster: (teamName) => 
    axios.get(`http://localhost:8080/api/team/${encodeURIComponent(teamName)}/roster`),

  /**
   * 특정 선수 상세 조회
   * @param {string} playerId
   * @returns Axios Promise
   */
  getPlayerDetail: (playerId) =>
    axios.get(`http://localhost:8080/api/players/${encodeURIComponent(playerId)}`),


setLineup: (gameId, lineupData) =>
  axios.post(`${API_BASE_URL}/baseball/game/${gameId}/lineup`, lineupData),
};

export default api;
