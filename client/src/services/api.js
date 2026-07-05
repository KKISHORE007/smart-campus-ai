// ============================================================
// Student Helpdesk Agent — Service: API Client
// ============================================================
// Axios wrapper for communicating with Node/Express backend.
// Handles auth headers, chat queries, and all 7 Super Admin modules.
// ============================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('helpdesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to log errors cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🌐 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- Authentication APIs ---

export async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function registerUser(data) {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function getInstitutionBranding(code = 'XYZ-EC') {
  const response = await apiClient.get(`/auth/institution/${code}`);
  return response.data;
}

export async function getPublicInfo() {
  const response = await apiClient.get('/auth/public-info');
  return response.data;
}

// --- Chat & Session APIs ---

export async function sendMessage(studentId, message, sessionId, role = 'student', userName = 'Member') {
  const response = await apiClient.post('/chat', {
    studentId,
    message,
    sessionId,
    role,
    userName,
  });
  return response.data;
}

export async function getChatHistory(sessionId) {
  const response = await apiClient.get(`/chat/history/${sessionId}`);
  return response.data;
}

export async function getStudentSessions(studentId, limit = 20) {
  const response = await apiClient.get(`/chat/sessions/${studentId}?limit=${limit}`);
  return response.data;
}

export async function deleteSession(sessionId) {
  const response = await apiClient.delete(`/chat/session/${sessionId}`);
  return response.data;
}

export async function getStudentProfile(studentId) {
  const response = await apiClient.get(`/students/${studentId}`);
  return response.data;
}

// --- Super Admin Module 1: College Profile & Branding ---
export async function getAdminBranding() {
  const response = await apiClient.get('/admin/branding');
  return response.data;
}
export async function updateAdminBranding(data) {
  const response = await apiClient.put('/admin/branding', data);
  return response.data;
}

// --- Super Admin Module 2: Gallery Management ---
export async function getAdminGallery() {
  const response = await apiClient.get('/admin/gallery');
  return response.data;
}
export async function addAdminGallery(data) {
  const response = await apiClient.post('/admin/gallery', data);
  return response.data;
}
export async function deleteAdminGallery(id) {
  const response = await apiClient.delete(`/admin/gallery/${id}`);
  return response.data;
}

// --- Super Admin Module 3: Fee Structure Management ---
export async function getAdminFees() {
  const response = await apiClient.get('/admin/fees');
  return response.data;
}
export async function addAdminFee(data) {
  const response = await apiClient.post('/admin/fees', data);
  return response.data;
}
export async function deleteAdminFee(id) {
  const response = await apiClient.delete(`/admin/fees/${id}`);
  return response.data;
}

// --- Super Admin Module 4: Document Upload for RAG ---
export async function uploadKnowledgeDoc(docData) {
  const response = await apiClient.post('/admin/docs/upload', docData);
  return response.data;
}
export async function getAdminDocs() {
  const response = await apiClient.get('/admin/docs');
  return response.data;
}
export async function deleteKnowledgeDoc(docId) {
  const response = await apiClient.delete(`/admin/docs/${docId}`);
  return response.data;
}

// --- Super Admin Module 5: Announcements / News Management ---
export async function getAdminAnnouncements() {
  const response = await apiClient.get('/admin/announcements');
  return response.data;
}
export async function addAdminAnnouncement(data) {
  const response = await apiClient.post('/admin/announcements', data);
  return response.data;
}
export async function deleteAdminAnnouncement(id) {
  const response = await apiClient.delete(`/admin/announcements/${id}`);
  return response.data;
}

// --- Super Admin Module 6: Basic User Management ---
export async function getAdminUsers() {
  const response = await apiClient.get('/admin/users');
  return response.data;
}
export async function addAdminUser(data) {
  const response = await apiClient.post('/admin/users', data);
  return response.data;
}
export async function deleteAdminUser(id) {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
}
export async function updateUserStatus(id, status) {
  const response = await apiClient.put(`/admin/users/${id}/status`, { status });
  return response.data;
}

// --- Super Admin Module 7: Knowledge Base Control ---
export async function getAdminStats() {
  const response = await apiClient.get('/admin/stats');
  return response.data;
}

// --- System APIs ---
export async function getSystemHealth() {
  const response = await apiClient.get('/system/health');
  return response.data;
}
export async function triggerSeed(force = false) {
  const response = await apiClient.post(`/system/seed?force=${force}`);
  return response.data;
}

export default apiClient;
