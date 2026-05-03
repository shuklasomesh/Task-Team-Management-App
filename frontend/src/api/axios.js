import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
}

export const userApi = {
  getMe: () => api.get('/users/me'),
  getAll: () => api.get('/users'),
  search: query => api.get(`/users/search?query=${encodeURIComponent(query)}`),
}

export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: id => api.get(`/projects/${id}`),
  create: data => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: id => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  getMembers: id => api.get(`/projects/${id}/members`),
}

export const taskApi = {
  getMyTasks: () => api.get('/tasks/my'),
  getProjectTasks: projectId => api.get(`/tasks/project/${projectId}`),
  getById: id => api.get(`/tasks/${id}`),
  create: data => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: id => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const sessionApi = {
  heartbeat: () => api.post('/sessions/heartbeat'),
  logout: () => api.post('/sessions/logout'),
  getOnline: () => api.get('/sessions/online'),
  getMemberStats: () => api.get('/sessions/member-stats'),
}

export const skillApi = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  delete: (id) => api.delete(`/skills/${id}`),
  getTests: () => api.get('/skills/tests'),
  getTest: (id) => api.get(`/skills/tests/${id}`),
  createTest: (data) => api.post('/skills/tests', data),
  startTest: (id) => api.post(`/skills/tests/${id}/start`),
  submitTest: (submissionId, answers) => api.post(`/skills/submissions/${submissionId}/submit`, answers),
  getLeaderboard: () => api.get('/skills/leaderboard'),
  getMySubmissions: () => api.get('/skills/my-submissions'),
}

export const chatApi = {
  getMessages: (after) => api.get('/chat/messages' + (after ? `?after=${after}` : '')),
  sendMessage: (content) => api.post('/chat/messages', { content }),
}

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}

export const dmApi = {
  getUsers: () => api.get('/dm/users'),
  getMessages: (userId, after) => api.get(`/dm/${userId}/messages` + (after ? `?after=${after}` : '')),
  sendMessage: (userId, content) => api.post(`/dm/${userId}/messages`, { content }),
  markRead: (userId) => api.patch(`/dm/${userId}/read`),
}

export const commentApi = {
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
}

export default api
