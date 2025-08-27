import axios from 'axios';

// Centralized API client
// Adjust baseURL if your backend runs elsewhere
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;

