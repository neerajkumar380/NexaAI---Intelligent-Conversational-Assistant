import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async verifyToken() {
    const response = await this.api.post('/auth/verify');
    return response.data;
  }

  // Chat methods
  async sendMessage(message, sessionId) {
    const response = await this.api.post('/chat/message', { message, sessionId });
    return response.data;
  }

  async getConversations(page = 1, limit = 10) {
    const response = await this.api.get(`/chat/conversations?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getConversation(sessionId) {
    const response = await this.api.get(`/chat/conversations/${sessionId}`);
    return response.data;
  }

  async deleteConversation(sessionId) {
    const response = await this.api.delete(`/chat/conversations/${sessionId}`);
    return response.data;
  }

  async getChatStats() {
    const response = await this.api.get('/chat/stats');
    return response.data;
  }

  // User methods
  async updateProfile(profile) {
    const response = await this.api.put('/user/profile', { profile });
    return response.data;
  }

  async updateChatbotPersona(chatbotPersona) {
    const response = await this.api.put('/user/chatbot-persona', { chatbotPersona });
    return response.data;
  }

  async getUserMemories(type, limit = 20) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit.toString());
    
    const response = await this.api.get(`/user/memories?${params}`);
    return response.data;
  }

  async clearUserMemories() {
    const response = await this.api.delete('/user/memories');
    return response.data;
  }

  async getUserPreferences() {
    const response = await this.api.get('/user/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences) {
    const response = await this.api.put('/user/preferences', { preferences });
    return response.data;
  }

  async getDashboardData() {
    const response = await this.api.get('/user/dashboard');
    return response.data;
  }
}

export default new ApiService();