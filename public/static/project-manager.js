// Plan-Craft v3.0 - Project Manager Module
// ==========================================
// Handles all project-related business logic
// Manages project state, timers, and lifecycle

import apiClient from './api-client.js';
import { 
  APP_CONFIG, 
  PHASE_ORDER, 
  PHASE_DURATION,
  getPhaseIndex,
  getPhaseDuration 
} from './constants.js';

/**
 * Project Manager Class
 * Centralized project state and operations
 */
class ProjectManager {
  constructor() {
    this.projects = [];
    this.timers = {};
    this.maxProjects = APP_CONFIG.MAX_PROJECTS;
  }

  /**
   * Initialize and load projects
   */
  async init() {
    console.log('[ProjectManager] Initializing...');
    await this.loadProjects();
    this.startAutoRefresh();
    console.log('[ProjectManager] ✅ Initialized');
  }

  /**
   * Load projects from API
   */
  async loadProjects() {
    const result = await apiClient.getActiveProjects();
    if (result.success) {
      this.projects = result.data.slice(0, this.maxProjects);
      console.log(`[ProjectManager] Loaded ${this.projects.length} projects`);
      return this.projects;
    }
    console.error('[ProjectManager] Failed to load projects');
    return [];
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    // Check max projects limit
    if (this.projects.length >= this.maxProjects) {
      throw new Error(`최대 ${this.maxProjects}개의 프로젝트만 동시에 진행할 수 있습니다.`);
    }

    console.log('[ProjectManager] Creating project:', projectData.projectName);
    const result = await apiClient.createProject(projectData);
    
    if (result.success) {
      const project = result.data;
      this.projects.push(project);
      this.startProjectTimer(project.projectId);
      console.log('[ProjectManager] ✅ Project created:', project.projectId);
      return project;
    }

    throw new Error(result.error || 'Failed to create project');
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    return this.projects.find(p => p.projectId === projectId);
  }

  /**
   * Pause project
   */
  async pauseProject(projectId) {
    console.log('[ProjectManager] Pausing project:', projectId);
    const result = await apiClient.pauseProject(projectId);
    
    if (result.success) {
      this.stopProjectTimer(projectId);
      await this.loadProjects();
      return true;
    }

    throw new Error(result.error || 'Failed to pause project');
  }

  /**
   * Resume project
   */
  async resumeProject(projectId) {
    console.log('[ProjectManager] Resuming project:', projectId);
    const result = await apiClient.resumeProject(projectId);
    
    if (result.success) {
      this.startProjectTimer(projectId);
      await this.loadProjects();
      return true;
    }

    throw new Error(result.error || 'Failed to resume project');
  }

  /**
   * Cancel project
   */
  async cancelProject(projectId) {
    console.log('[ProjectManager] Canceling project:', projectId);
    const result = await apiClient.cancelProject(projectId);
    
    if (result.success) {
      this.stopProjectTimer(projectId);
      this.projects = this.projects.filter(p => p.projectId !== projectId);
      await this.loadProjects();
      return true;
    }

    throw new Error(result.error || 'Failed to cancel project');
  }

  /**
   * Pause all projects
   */
  async pauseAll() {
    console.log('[ProjectManager] Pausing all projects');
    const promises = this.projects.map(p => this.pauseProject(p.projectId));
    await Promise.allSettled(promises);
  }

  /**
   * Cancel all projects
   */
  async cancelAll() {
    console.log('[ProjectManager] Canceling all projects');
    const promises = this.projects.map(p => this.cancelProject(p.projectId));
    await Promise.allSettled(promises);
  }

  /**
   * Calculate project time information
   */
  calculateTimeInfo(project) {
    const currentPhase = project.currentPhase || 'G1_CORE_LOGIC';
    const currentIndex = getPhaseIndex(currentPhase);

    if (currentIndex === -1) {
      return {
        elapsedMinutes: 0,
        remainingMinutes: 0,
        totalMinutes: 0,
        percent: 0,
        elapsedText: '계산 중...',
        remainingText: '계산 중...'
      };
    }

    // Calculate elapsed time (completed phases)
    let elapsedMinutes = 0;
    for (let i = 0; i < currentIndex; i++) {
      elapsedMinutes += getPhaseDuration(PHASE_ORDER[i]);
    }

    // Add current phase progress (assume 50% if running)
    if (project.status === 'active' || project.status === 'running') {
      elapsedMinutes += getPhaseDuration(currentPhase) * 0.5;
    }

    // Calculate remaining time
    let remainingMinutes = 0;
    for (let i = currentIndex; i < PHASE_ORDER.length; i++) {
      remainingMinutes += getPhaseDuration(PHASE_ORDER[i]);
    }

    // Total time
    const totalMinutes = Object.values(PHASE_DURATION).reduce((a, b) => a + b, 0);
    const percent = Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100));

    return {
      elapsedMinutes,
      remainingMinutes,
      totalMinutes,
      percent,
      elapsedText: this.formatTimeMinutes(elapsedMinutes),
      remainingText: this.formatTimeMinutes(remainingMinutes)
    };
  }

  /**
   * Format time in minutes
   */
  formatTimeMinutes(minutes) {
    if (minutes < 1) return '< 1분';
    if (minutes < 60) return `${Math.round(minutes)}분`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}시간 ${mins}분`;
  }

  /**
   * Start project timer
   */
  startProjectTimer(projectId) {
    // Clear existing timer
    this.stopProjectTimer(projectId);

    // Create new timer
    this.timers[projectId] = setInterval(() => {
      this.updateProjectTime(projectId);
    }, APP_CONFIG.TIME_UPDATE_INTERVAL);

    // Initial update
    this.updateProjectTime(projectId);
  }

  /**
   * Stop project timer
   */
  stopProjectTimer(projectId) {
    if (this.timers[projectId]) {
      clearInterval(this.timers[projectId]);
      delete this.timers[projectId];
    }
  }

  /**
   * Update project time (to be implemented by UI layer)
   */
  updateProjectTime(projectId) {
    // This will be called by the timer
    // UI layer should listen for this and update the display
    const event = new CustomEvent('projectTimeUpdate', {
      detail: { projectId }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    setInterval(() => {
      this.loadProjects();
    }, APP_CONFIG.PROJECTS_REFRESH_INTERVAL);
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return this.projects;
  }

  /**
   * Get project count
   */
  getProjectCount() {
    return this.projects.length;
  }

  /**
   * Check if can create new project
   */
  canCreateProject() {
    return this.projects.length < this.maxProjects;
  }
}

// Create singleton instance
const projectManager = new ProjectManager();

// Export as default
export default projectManager;

// Also expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.projectManager = projectManager;
}

console.log('[Project Manager Module] ✅ Loaded successfully');
