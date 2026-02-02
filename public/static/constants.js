// Plan-Craft v3.0 - Core Constants Module
// ============================================
// This module contains ALL core constants used across the application
// SINGLE SOURCE OF TRUTH for configuration

/**
 * Phase Configuration
 * Maps each development phase to its duration in minutes
 */
export const PHASE_DURATION = {
  'G1_CORE_LOGIC': 3,
  'G2_API_SERVER': 4,
  'G3_UI_COMPONENTS': 5,
  'G4_INTEGRATION': 3,
  'G5_UNIT_TESTS': 4,
  'G6_SECURITY_SCAN': 2,
  'G7_BUILD_OPTIMIZATION': 2,
  'G8_DEPLOYMENT': 3,
  'G9_DOCUMENTATION': 2,
  'G10_HANDOVER': 1
};

/**
 * Phase Order
 * Defines the execution sequence of phases
 */
export const PHASE_ORDER = [
  'G1_CORE_LOGIC',
  'G2_API_SERVER',
  'G3_UI_COMPONENTS',
  'G4_INTEGRATION',
  'G5_UNIT_TESTS',
  'G6_SECURITY_SCAN',
  'G7_BUILD_OPTIMIZATION',
  'G8_DEPLOYMENT',
  'G9_DOCUMENTATION',
  'G10_HANDOVER'
];

/**
 * Phase to AI Model Mapping
 * Maps which AI model handles each phase
 */
export const PHASE_TO_MODEL = {
  'G1_CORE_LOGIC': 'claude-3.5-sonnet',
  'G2_API_SERVER': 'gpt-4-turbo',
  'G3_UI_COMPONENTS': 'gpt-4-turbo',
  'G4_INTEGRATION': 'claude-3.5-sonnet',
  'G5_UNIT_TESTS': 'gpt-4o-mini',
  'G6_SECURITY_SCAN': 'gpt-4o-mini',
  'G7_BUILD_OPTIMIZATION': 'gemini-2.0-flash',
  'G8_DEPLOYMENT': 'gemini-2.0-flash',
  'G9_DOCUMENTATION': 'gpt-4-turbo',
  'G10_HANDOVER': 'claude-3.5-sonnet'
};

/**
 * AI Model to Agent Mapping
 * Maps AI models to their agent names
 */
export const MODEL_TO_AGENT = {
  'claude-3.5-sonnet': 'Master Orchestrator',
  'gpt-4-turbo': 'Code Agent',
  'gpt-4o-mini': 'Quality Agent',
  'gemini-2.0-flash': 'DevOps Agent'
};

/**
 * Phase Task Descriptions
 * Human-readable descriptions for each phase
 */
export const PHASE_TASKS = {
  'G1_CORE_LOGIC': '핵심 로직 구현 중',
  'G2_API_SERVER': 'API 서버 구축 중',
  'G3_UI_COMPONENTS': 'UI 컴포넌트 개발 중',
  'G4_INTEGRATION': '시스템 통합 중',
  'G5_UNIT_TESTS': '단위 테스트 작성 중',
  'G6_SECURITY_SCAN': '보안 스캔 수행 중',
  'G7_BUILD_OPTIMIZATION': '빌드 최적화 중',
  'G8_DEPLOYMENT': '배포 준비 중',
  'G9_DOCUMENTATION': '문서화 작업 중',
  'G10_HANDOVER': '최종 인수인계 중'
};

/**
 * Phase Labels
 * Short labels for UI display
 */
export const PHASE_LABELS = {
  'G1_CORE_LOGIC': '핵심 로직 구현',
  'G2_API_SERVER': 'API 서버 구축',
  'G3_UI_COMPONENTS': 'UI 컴포넌트 개발',
  'G4_INTEGRATION': '시스템 통합',
  'G5_UNIT_TESTS': '단위 테스트',
  'G6_SECURITY_SCAN': '보안 스캔',
  'G7_BUILD_OPTIMIZATION': '빌드 최적화',
  'G8_DEPLOYMENT': '배포 준비',
  'G9_DOCUMENTATION': '문서화',
  'G10_HANDOVER': '최종 인수인계'
};

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  API_BASE: '/api',
  MAX_PROJECTS: 3,
  MAX_LOGS: 10,
  STATS_REFRESH_INTERVAL: 5000,      // 5 seconds
  PROJECTS_REFRESH_INTERVAL: 10000,  // 10 seconds
  TIME_UPDATE_INTERVAL: 10000,       // 10 seconds
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_DELAY: 5000                  // 5 seconds
};

/**
 * Log Levels
 */
export const LOG_LEVELS = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARN: 'WARN'
};

/**
 * Log Level Styling
 */
export const LOG_LEVEL_STYLES = {
  INFO: { color: 'text-blue-400', icon: '◆' },
  SUCCESS: { color: 'text-green-400', icon: '✓' },
  ERROR: { color: 'text-red-400', icon: '✗' },
  WARN: { color: 'text-yellow-400', icon: '⚠' }
};

/**
 * Utility Functions
 */
export function getTotalDuration() {
  return Object.values(PHASE_DURATION).reduce((a, b) => a + b, 0);
}

export function getPhaseLabel(phase) {
  return PHASE_LABELS[phase] || phase;
}

export function getPhaseTask(phase) {
  return PHASE_TASKS[phase] || 'Unknown task';
}

export function getModelForPhase(phase) {
  return PHASE_TO_MODEL[phase] || 'claude-3.5-sonnet';
}

export function getAgentForModel(model) {
  return MODEL_TO_AGENT[model] || 'Unknown Agent';
}

export function getPhaseDuration(phase) {
  return PHASE_DURATION[phase] || 3;
}

export function getPhaseIndex(phase) {
  return PHASE_ORDER.indexOf(phase);
}

export function isValidPhase(phase) {
  return PHASE_ORDER.includes(phase);
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.PHASE_DURATION = PHASE_DURATION;
  window.PHASE_ORDER = PHASE_ORDER;
  window.PHASE_TO_MODEL = PHASE_TO_MODEL;
  window.MODEL_TO_AGENT = MODEL_TO_AGENT;
  window.PHASE_TASKS = PHASE_TASKS;
  window.PHASE_LABELS = PHASE_LABELS;
  window.APP_CONFIG = APP_CONFIG;
}

console.log('[Constants Module] ✅ Loaded successfully');
