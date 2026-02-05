// Plan-Craft v3.0 - Core Constants Module
// ============================================
// This module contains ALL core constants used across the application
// SINGLE SOURCE OF TRUTH for configuration

/**
 * Phase Configuration
 * Maps each report writing phase to its duration in minutes
 * OPTIMIZED: Focused on report generation (12min base for medium complexity)
 */
export const PHASE_DURATION = {
  'G1_REQUIREMENT_ANALYSIS': 1.2,    // 요구사항 분석
  'G2_DATA_COLLECTION': 1.5,         // 자료 수집 및 정리
  'G3_OUTLINE_CREATION': 2,          // 보고서 개요 작성
  'G4_CONTENT_WRITING': 1.2,         // 본문 작성
  'G5_DATA_VISUALIZATION': 1.5,      // 데이터 시각화
  'G6_QUALITY_REVIEW': 0.8,          // 품질 검토
  'G7_FORMAT_OPTIMIZATION': 0.8,     // 서식 최적화
  'G8_FINAL_REVIEW': 1.2,            // 최종 검토
  'G9_EXPORT_PREPARATION': 0.8,      // 출력 준비
  'G10_DELIVERY': 0.5                // 최종 전달
};

/**
 * Phase Order
 * Defines the execution sequence of report writing phases
 */
export const PHASE_ORDER = [
  'G1_REQUIREMENT_ANALYSIS',
  'G2_DATA_COLLECTION',
  'G3_OUTLINE_CREATION',
  'G4_CONTENT_WRITING',
  'G5_DATA_VISUALIZATION',
  'G6_QUALITY_REVIEW',
  'G7_FORMAT_OPTIMIZATION',
  'G8_FINAL_REVIEW',
  'G9_EXPORT_PREPARATION',
  'G10_DELIVERY'
];

/**
 * Phase to AI Model Mapping
 * Maps which AI model handles each report writing phase
 */
export const PHASE_TO_MODEL = {
  'G1_REQUIREMENT_ANALYSIS': 'claude-3.5-sonnet',
  'G2_DATA_COLLECTION': 'gpt-4-turbo',
  'G3_OUTLINE_CREATION': 'gpt-4-turbo',
  'G4_CONTENT_WRITING': 'claude-3.5-sonnet',
  'G5_DATA_VISUALIZATION': 'gpt-4o-mini',
  'G6_QUALITY_REVIEW': 'gpt-4o-mini',
  'G7_FORMAT_OPTIMIZATION': 'gemini-2.0-flash',
  'G8_FINAL_REVIEW': 'gemini-2.0-flash',
  'G9_EXPORT_PREPARATION': 'gpt-4-turbo',
  'G10_DELIVERY': 'claude-3.5-sonnet'
};

/**
 * AI Model to Agent Mapping
 * Maps AI models to their agent names
 */
export const MODEL_TO_AGENT = {
  // Latest models (2026)
  'gpt-4o': 'Master Orchestrator',
  'claude-3-opus': 'Master Orchestrator',
  'claude-3.5-sonnet': 'Master Orchestrator',
  'gpt-4-turbo': 'Code Agent',
  'gpt-4o-mini': 'Quality Agent',
  'gemini-2.0-flash': 'DevOps Agent',
  'gemini-1.5-pro': 'DevOps Agent',
  // Legacy models (for compatibility)
  'gpt-3.5-turbo': 'Code Agent',
  'claude-3-sonnet': 'Master Orchestrator',
  'claude-3-haiku': 'Quality Agent'
};

/**
 * Available AI Models by Provider
 * Latest models with ratings and capabilities
 */
export const AI_MODELS = {
  openai: {
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4O',
        rating: 4.8,
        speed: 'fast',
        cost: 'medium',
        capabilities: ['coding', 'reasoning', 'creative', 'analysis'],
        description: '최신 GPT-4 Optimized 모델 - 빠르고 정확한 응답'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        rating: 4.7,
        speed: 'fast',
        cost: 'medium',
        capabilities: ['coding', 'reasoning', 'analysis'],
        description: 'GPT-4의 빠른 버전 - 128K 컨텍스트'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4O Mini',
        rating: 4.5,
        speed: 'very-fast',
        cost: 'low',
        capabilities: ['coding', 'analysis', 'qa'],
        description: '경량화 모델 - 빠르고 경제적'
      }
    ]
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        rating: 4.9,
        speed: 'medium',
        cost: 'high',
        capabilities: ['coding', 'reasoning', 'creative', 'analysis', 'complex-tasks'],
        description: '최고 성능 모델 - 복잡한 작업에 최적'
      },
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        rating: 4.8,
        speed: 'fast',
        cost: 'medium',
        capabilities: ['coding', 'reasoning', 'creative', 'analysis'],
        description: '균형잡힌 성능 - 대부분의 작업에 적합'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        rating: 4.6,
        speed: 'fast',
        cost: 'medium',
        capabilities: ['coding', 'reasoning', 'analysis'],
        description: '빠르고 효율적인 모델'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        rating: 4.4,
        speed: 'very-fast',
        cost: 'low',
        capabilities: ['qa', 'analysis', 'simple-tasks'],
        description: '초고속 경량 모델'
      }
    ]
  },
  google: {
    name: 'Google AI',
    models: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        rating: 4.7,
        speed: 'very-fast',
        cost: 'low',
        capabilities: ['coding', 'reasoning', 'multimodal'],
        description: '최신 Gemini - 초고속 처리'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        rating: 4.6,
        speed: 'fast',
        cost: 'medium',
        capabilities: ['coding', 'reasoning', 'multimodal', 'long-context'],
        description: 'Pro 버전 - 1M 토큰 컨텍스트'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        rating: 4.5,
        speed: 'very-fast',
        cost: 'low',
        capabilities: ['qa', 'analysis', 'multimodal'],
        description: '빠른 Flash 모델'
      }
    ]
  }
};

/**
 * Phase Task Descriptions
 * Human-readable descriptions for each report writing phase
 */
export const PHASE_TASKS = {
  'G1_REQUIREMENT_ANALYSIS': '요구사항 분석 중',
  'G2_DATA_COLLECTION': '자료 수집 및 정리 중',
  'G3_OUTLINE_CREATION': '보고서 개요 작성 중',
  'G4_CONTENT_WRITING': '본문 작성 중',
  'G5_DATA_VISUALIZATION': '데이터 시각화 중',
  'G6_QUALITY_REVIEW': '품질 검토 중',
  'G7_FORMAT_OPTIMIZATION': '서식 최적화 중',
  'G8_FINAL_REVIEW': '최종 검토 중',
  'G9_EXPORT_PREPARATION': '출력 준비 중',
  'G10_DELIVERY': '최종 전달 중'
};

/**
 * Phase Labels
 * Short labels for UI display (report writing phases)
 */
export const PHASE_LABELS = {
  'G1_REQUIREMENT_ANALYSIS': '요구사항 분석',
  'G2_DATA_COLLECTION': '자료 수집',
  'G3_OUTLINE_CREATION': '개요 작성',
  'G4_CONTENT_WRITING': '본문 작성',
  'G5_DATA_VISUALIZATION': '데이터 시각화',
  'G6_QUALITY_REVIEW': '품질 검토',
  'G7_FORMAT_OPTIMIZATION': '서식 최적화',
  'G8_FINAL_REVIEW': '최종 검토',
  'G9_EXPORT_PREPARATION': '출력 준비',
  'G10_DELIVERY': '최종 전달'
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
