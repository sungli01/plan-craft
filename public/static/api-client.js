// Plan-Craft v3.0 - API Client Module
// ========================================
// Centralized API communication layer
// Handles all HTTP requests with error handling and retries

import { APP_CONFIG } from './constants.js';

/**
 * API Client Class
 * Manages all backend communication
 */
class APIClient {
  constructor(baseURL = APP_CONFIG.API_BASE) {
    this.baseURL = baseURL;
    this.requestCount = 0;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = ++this.requestCount;
    
    console.log(`[API ${requestId}] ${options.method || 'GET'} ${endpoint}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[API ${requestId}] ✅ Success`);
      return { success: true, data };

    } catch (error) {
      console.error(`[API ${requestId}] ❌ Error:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== Project APIs ====================

  /**
   * Create a new project
   */
  async createProject(projectData) {
    console.log('[API] Creating project:', projectData.projectName);
    return this.post('/projects', projectData);
  }

  /**
   * Get project details
   */
  async getProject(projectId) {
    return this.get(`/projects/${projectId}`);
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    return this.put(`/projects/${projectId}`, updates);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    return this.delete(`/projects/${projectId}`);
  }

  /**
   * Pause project
   */
  async pauseProject(projectId) {
    console.log('[API] Pausing project:', projectId);
    return this.post(`/projects/${projectId}/pause`, {});
  }

  /**
   * Resume project
   */
  async resumeProject(projectId) {
    console.log('[API] Resuming project:', projectId);
    return this.post(`/projects/${projectId}/resume`, {});
  }

  /**
   * Cancel project
   */
  async cancelProject(projectId) {
    console.log('[API] Canceling project:', projectId);
    return this.post(`/projects/${projectId}/cancel`, {});
  }

  // ==================== Stats APIs ====================

  /**
   * Get system statistics
   */
  async getStats() {
    return this.get('/stats');
  }

  /**
   * Get active projects
   */
  async getActiveProjects() {
    const result = await this.getStats();
    if (result.success && result.data.projects) {
      return {
        success: true,
        data: result.data.projects.filter(p => 
          p.status === 'active' || p.status === 'running'
        )
      };
    }
    return { success: false, error: 'Failed to load projects' };
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Export as default
export default apiClient;

// Also expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
}

console.log('[API Client Module] ✅ Loaded successfully');
