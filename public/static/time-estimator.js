// Plan-Craft v6.0 - Project Time Estimator Module
// =================================================
// Analyzes project scope and provides accurate time estimates

import { PHASE_ORDER, getPhaseDuration } from './constants.js';

/**
 * Project Time Estimator
 * Analyzes project complexity and calculates estimated completion time
 */
class ProjectTimeEstimator {
  constructor() {
    this.complexityFactors = {
      'simple': 0.7,      // Simple projects: 70% of base time
      'medium': 1.0,      // Medium projects: 100% of base time
      'complex': 1.5,     // Complex projects: 150% of base time
      'very-complex': 2.0 // Very complex: 200% of base time
    };
  }

  /**
   * Analyze project and estimate time
   */
  analyzeProject(projectName, userIdea, references = []) {
    console.log('[TimeEstimator] Analyzing project:', projectName);

    // Analyze complexity
    const complexity = this.determineComplexity(userIdea, references);
    
    // Analyze scope
    const scope = this.analyzeScope(userIdea);
    
    // Calculate base time
    const baseTime = this.calculateBaseTime();
    
    // Apply complexity factor
    const factor = this.complexityFactors[complexity];
    const estimatedTime = Math.round(baseTime * factor);
    
    // Calculate per-phase breakdown
    const phaseBreakdown = this.calculatePhaseBreakdown(factor);
    
    const result = {
      complexity,
      complexityLabel: this.getComplexityLabel(complexity),
      scope,
      baseTime,
      factor,
      estimatedTime, // in minutes
      estimatedTimeText: this.formatTime(estimatedTime),
      phaseBreakdown,
      reasoning: this.generateReasoning(complexity, scope, estimatedTime)
    };

    console.log('[TimeEstimator] Result:', result);
    
    // Add to thinking process
    if (window.thinkingProcess) {
      const breakdown = phaseBreakdown.map(p => 
        `${p.label}: ${p.duration}분`
      ).join('\n');
      
      window.thinkingProcess.addTimeEstimation(estimatedTime, breakdown);
      window.thinkingProcess.addThought(
        'analysis',
        `프로젝트 복잡도: ${result.complexityLabel}\n${result.reasoning}`
      );
    }

    return result;
  }

  /**
   * Determine project complexity
   */
  determineComplexity(userIdea, references) {
    const idea = userIdea.toLowerCase();
    let score = 0;

    // Keywords indicating complexity
    const complexKeywords = [
      'ai', '인공지능', '머신러닝', 'ml', 'deep learning',
      '블록체인', 'blockchain', '실시간', 'real-time',
      '대규모', 'scale', '분산', 'distributed',
      '보안', 'security', '암호화', 'encryption'
    ];

    const mediumKeywords = [
      'api', '데이터베이스', 'database', '인증', 'auth',
      '결제', 'payment', '검색', 'search',
      '추천', 'recommendation', '알림', 'notification'
    ];

    // Count complex keywords
    complexKeywords.forEach(keyword => {
      if (idea.includes(keyword)) score += 2;
    });

    // Count medium keywords
    mediumKeywords.forEach(keyword => {
      if (idea.includes(keyword)) score += 1;
    });

    // References add complexity
    score += references.length * 0.5;

    // Word count indicates scope
    const wordCount = userIdea.split(/\s+/).length;
    if (wordCount > 100) score += 2;
    else if (wordCount > 50) score += 1;

    // Determine complexity level
    if (score >= 8) return 'very-complex';
    if (score >= 5) return 'complex';
    if (score >= 2) return 'medium';
    return 'simple';
  }

  /**
   * Analyze project scope
   */
  analyzeScope(userIdea) {
    const idea = userIdea.toLowerCase();
    
    const features = {
      authentication: idea.match(/로그인|회원|auth|user|사용자/),
      database: idea.match(/데이터|database|저장|db/),
      api: idea.match(/api|서버|server/),
      ui: idea.match(/화면|ui|인터페이스|디자인/),
      payment: idea.match(/결제|payment|구매|purchase/),
      search: idea.match(/검색|search|찾기/),
      realtime: idea.match(/실시간|real-time|live/),
      analytics: idea.match(/분석|analytics|통계|statistics/),
      notification: idea.match(/알림|notification|푸시|push/),
      admin: idea.match(/관리자|admin|대시보드|dashboard/)
    };

    const featureCount = Object.values(features).filter(Boolean).length;

    return {
      features,
      featureCount,
      estimatedPages: Math.max(3, featureCount * 2),
      estimatedComponents: featureCount * 5
    };
  }

  /**
   * Calculate base time (sum of all phase durations)
   */
  calculateBaseTime() {
    return PHASE_ORDER.reduce((total, phase) => {
      return total + getPhaseDuration(phase);
    }, 0);
  }

  /**
   * Calculate phase-by-phase time breakdown
   */
  calculatePhaseBreakdown(factor) {
    return PHASE_ORDER.map(phase => {
      const baseDuration = getPhaseDuration(phase);
      const adjustedDuration = Math.round(baseDuration * factor);
      
      return {
        phase,
        label: this.getPhaseLabel(phase),
        baseDuration,
        adjustedDuration: adjustedDuration,
        duration: adjustedDuration
      };
    });
  }

  /**
   * Get phase label
   */
  getPhaseLabel(phase) {
    const labels = {
      'G1_CORE_LOGIC': '핵심 로직',
      'G2_API_SERVER': 'API 서버',
      'G3_UI_COMPONENTS': 'UI 컴포넌트',
      'G4_INTEGRATION': '시스템 통합',
      'G5_UNIT_TESTS': '단위 테스트',
      'G6_SECURITY_SCAN': '보안 스캔',
      'G7_BUILD_OPTIMIZATION': '빌드 최적화',
      'G8_DEPLOYMENT': '배포 준비',
      'G9_DOCUMENTATION': '문서화',
      'G10_HANDOVER': '최종 인수인계'
    };
    return labels[phase] || phase;
  }

  /**
   * Get complexity label
   */
  getComplexityLabel(complexity) {
    const labels = {
      'simple': '간단함 (★☆☆☆)',
      'medium': '보통 (★★☆☆)',
      'complex': '복잡함 (★★★☆)',
      'very-complex': '매우 복잡함 (★★★★)'
    };
    return labels[complexity] || complexity;
  }

  /**
   * Format time in minutes to readable string
   */
  formatTime(minutes) {
    if (minutes < 60) {
      return `약 ${minutes}분`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `약 ${hours}시간`;
    }
    
    return `약 ${hours}시간 ${mins}분`;
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoning(complexity, scope, estimatedTime) {
    const reasons = [];

    // Complexity reason
    if (complexity === 'very-complex') {
      reasons.push('매우 복잡한 시스템으로 판단됨 (AI/ML, 실시간 처리, 대규모 데이터 등)');
    } else if (complexity === 'complex') {
      reasons.push('복잡한 기능들이 포함됨 (인증, 결제, 데이터베이스 등)');
    } else if (complexity === 'medium') {
      reasons.push('중간 수준의 기능들이 요구됨');
    } else {
      reasons.push('비교적 단순한 시스템');
    }

    // Scope reason
    if (scope.featureCount >= 5) {
      reasons.push(`다수의 핵심 기능 포함 (${scope.featureCount}개)`);
    } else if (scope.featureCount >= 3) {
      reasons.push(`적절한 수준의 기능 포함 (${scope.featureCount}개)`);
    }

    // Time estimate reason
    if (estimatedTime > 45) {
      reasons.push('충분한 검증과 테스트 시간 필요');
    }

    return reasons.join('. ');
  }

  /**
   * Show time estimation modal
   */
  showEstimationModal(result) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.id = 'time-estimation-modal';

    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-clock text-purple-600"></i>
              프로젝트 소요 시간 분석
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Master Orchestrator가 프로젝트를 분석하여 정확한 시간을 예측했습니다
            </p>
          </div>
          <button
            onclick="this.closest('.fixed').remove()"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
            <p class="text-sm text-purple-700 font-semibold mb-2">복잡도</p>
            <p class="text-2xl font-bold text-purple-900">${result.complexityLabel}</p>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <p class="text-sm text-blue-700 font-semibold mb-2">예상 소요 시간</p>
            <p class="text-2xl font-bold text-blue-900">${result.estimatedTimeText}</p>
          </div>
        </div>

        <div class="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 class="font-bold text-yellow-900 mb-2">
            <i class="fas fa-lightbulb mr-2"></i>
            분석 근거
          </h3>
          <p class="text-sm text-yellow-800">${result.reasoning}</p>
        </div>

        <div class="mb-6">
          <h3 class="font-bold text-gray-800 mb-3">
            <i class="fas fa-list-check mr-2"></i>
            단계별 예상 시간
          </h3>
          <div class="space-y-2">
            ${result.phaseBreakdown.map((phase, index) => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    ${index + 1}
                  </span>
                  <span class="font-medium text-gray-800">${phase.label}</span>
                </div>
                <span class="font-bold text-purple-600">${phase.duration}분</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <h3 class="font-bold text-green-900 mb-2">
            <i class="fas fa-check-circle mr-2"></i>
            발견된 주요 기능
          </h3>
          <div class="flex flex-wrap gap-2">
            ${Object.entries(result.scope.features)
              .filter(([_, value]) => value)
              .map(([feature, _]) => `
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ${this.getFeatureLabel(feature)}
                </span>
              `).join('')}
          </div>
          <p class="text-sm text-green-700 mt-3">
            총 ${result.scope.featureCount}개 기능, 
            예상 페이지 수: ${result.scope.estimatedPages}개, 
            예상 컴포넌트 수: ${result.scope.estimatedComponents}개
          </p>
        </div>

        <button
          onclick="this.closest('.fixed').remove(); window.confirmProjectStart?.()"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
        >
          <i class="fas fa-play-circle mr-2"></i>
          예상 시간 확인 - 프로젝트 시작
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Get feature label in Korean
   */
  getFeatureLabel(feature) {
    const labels = {
      authentication: '인증',
      database: '데이터베이스',
      api: 'API',
      ui: 'UI/UX',
      payment: '결제',
      search: '검색',
      realtime: '실시간',
      analytics: '분석',
      notification: '알림',
      admin: '관리자'
    };
    return labels[feature] || feature;
  }
}

// Create singleton instance
const timeEstimator = new ProjectTimeEstimator();

// Expose to window
if (typeof window !== 'undefined') {
  window.timeEstimator = timeEstimator;
}

export default timeEstimator;

console.log('[Project Time Estimator Module] ✅ Loaded successfully');
