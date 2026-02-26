import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  getCurrent: () => api.get('/users/current/me'),
  updateStatus: (id: string, data: { status: string; status_emoji: string; status_message?: string }) =>
    api.put(`/users/${id}/status`, data),
  updateProfile: (id: string, data: any) => api.put(`/users/${id}/profile`, data),
};

export const circleApi = {
  getAll: () => api.get('/circles'),
  getOne: (id: string) => api.get(`/circles/${id}`),
  getMembers: (id: string) => api.get(`/circles/${id}/members`),
  create: (data: any) => api.post('/circles', data),
};

export const footprintApi = {
  getAll: () => api.get('/footprints'),
  getByCircle: (circleId: string) => api.get(`/footprints/circle/${circleId}`),
};

export const reactionApi = {
  getAll: () => api.get('/reactions'),
  create: (data: { from_user_id: string; to_user_id: string; reaction_type: string; message?: string }) =>
    api.post('/reactions', data),
};

export const emergencyApi = {
  send: (data: { user_id: string; circle_ids: string[] }) => api.post('/emergency', data),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getByUser: (userId: string) => api.get(`/notifications/user/${userId}`),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const placeApi = {
  getAll: () => api.get('/places'),
  getByUser: (userId: string) => api.get(`/places/user/${userId}`),
  create: (data: { user_id: string; name: string; type: string; is_danger_zone?: boolean }) =>
    api.post('/places', data),
};

export const travelApi = {
  getActive: () => api.get('/travel'),
  getByUser: (userId: string) => api.get(`/travel/user/${userId}`),
  create: (data: any) => api.post('/travel', data),
  markLanded: (id: string) => api.put(`/travel/${id}/land`),
  updateProgress: (id: string, progress: number) => api.put(`/travel/${id}/progress?progress=${progress}`),
};

export const checkinApi = {
  send: (fromUserId: string, toUserId: string) =>
    api.post(`/checkin?from_user_id=${fromUserId}&to_user_id=${toUserId}`),
};

export default api;