import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  // Profile
  getBio: () => axios.get(`${API_BASE_URL}/profile/bio`),
  getResume: () => axios.get(`${API_BASE_URL}/profile/resume`),

  // Projects
  getAllProjects: () => axios.get(`${API_BASE_URL}/projects/`),
  getFeaturedProjects: () => axios.get(`${API_BASE_URL}/projects/featured`),

  // GitHub
  getGitHubStats: (username: string = 'ar586') =>
    axios.get(`${API_BASE_URL}/cached/github/stats/${username}`),
  getGitHubRepos: (username: string = 'ar586') =>
    axios.get(`${API_BASE_URL}/cached/github/repos/${username}`),
  getGitHubHeatmap: (username: string = 'ar586') =>
    axios.get(`${API_BASE_URL}/cached/github/heatmap/${username}`),
  // Direct GitHub API (via backend proxy) for events (not cached)
  getGitHubEvents: (username: string = 'ar586') =>
    axios.get(`${API_BASE_URL}/github/events/${username}`),
  // Direct repos call if needed (optional)
  getGitHubReposDirect: (username: string = 'ar586') =>
    axios.get(`${API_BASE_URL}/github/repos/${username}`),

  // LeetCode
  getLeetCodeStats: (username: string = 'aryan_anand2006') =>
    axios.get(`${API_BASE_URL}/cached/leetcode/stats/${username}`),
  getLeetCodeHeatmap: (username: string = 'aryan_anand2006') =>
    axios.get(`${API_BASE_URL}/cached/leetcode/heatmap/${username}`),
  getLeetCodeRecent: (username: string = 'aryan_anand2006') =>
    axios.get(`${API_BASE_URL}/leetcode/recent/${username}`),

  // Chat
  sendMessage: (message: string, sessionId?: string) =>
    axios.post(`${API_BASE_URL}/chat/query`, { message, session_id: sessionId }),
};

export default api;
