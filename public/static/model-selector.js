// Plan-Craft v5.0 - Dynamic Model Selector Module
// ==================================================
// AI-powered model selection based on project topic and user ratings

import { AI_MODELS } from './constants.js';

/**
 * Model Selector
 * Dynamically selects best AI models based on project requirements
 */
class ModelSelector {
  constructor() {
    this.defaultModels = {
      'Master Orchestrator': 'claude-3.5-sonnet',
      'Code Agent': 'gpt-4-turbo',
      'Quality Agent': 'gpt-4o-mini',
      'DevOps Agent': 'gemini-2.0-flash'
    };
  }

  /**
   * Analyze project and select optimal models
   * Master Orchestrator role: analyze topic and assign best models
   */
  async selectModelsForProject(projectName, userIdea) {
    console.log('[ModelSelector] Analyzing project:', projectName);

    // Simulate Master Orchestrator analysis
    const analysis = this.analyzeProjectTopic(userIdea);
    
    // Select models based on analysis
    const selectedModels = {
      orchestrator: this.selectBestModel('orchestrator', analysis),
      codeAgent: this.selectBestModel('code', analysis),
      qualityAgent: this.selectBestModel('quality', analysis),
      devopsAgent: this.selectBestModel('devops', analysis)
    };

    console.log('[ModelSelector] Selected models:', selected Models);
    
    return {
      models: selectedModels,
      analysis: analysis,
      reasoning: this.generateReasoning(analysis, selectedModels)
    };
  }

  /**
   * Analyze project topic to determine requirements
   */
  analyzeProjectTopic(userIdea) {
    const idea = userIdea.toLowerCase();
    
    // Detect project type
    let projectType = 'general';
    let complexity = 'medium';
    let requiredCapabilities = [];

    // E-commerce / Shopping
    if (idea.match(/쇼핑|이커머스|e-commerce|몰|commerce|구매|판매/)) {
      projectType = 'ecommerce';
      complexity = 'high';
      requiredCapabilities = ['coding', 'reasoning', 'analysis', 'complex-tasks'];
    }
    // AI / Machine Learning
    else if (idea.match(/ai|인공지능|머신러닝|딥러닝|학습|ml|deep learning/)) {
      projectType = 'ai-ml';
      complexity = 'high';
      requiredCapabilities = ['reasoning', 'analysis', 'complex-tasks', 'creative'];
    }
    // Web Application
    else if (idea.match(/웹|web|사이트|site|플랫폼|platform/)) {
      projectType = 'web-app';
      complexity = 'medium';
      requiredCapabilities = ['coding', 'analysis'];
    }
    // Mobile App
    else if (idea.match(/모바일|앱|app|어플|application|ios|android/)) {
      projectType = 'mobile-app';
      complexity = 'high';
      requiredCapabilities = ['coding', 'reasoning', 'analysis'];
    }
    // Data Analysis
    else if (idea.match(/데이터|분석|analytics|dashboard|시각화|visualization/)) {
      projectType = 'data-analytics';
      complexity = 'medium';
      requiredCapabilities = ['analysis', 'reasoning'];
    }
    // Content / Creative
    else if (idea.match(/컨텐츠|콘텐츠|content|창작|creative|미디어|media/)) {
      projectType = 'content-creative';
      complexity = 'medium';
      requiredCapabilities = ['creative', 'reasoning'];
    }

    // Detect speed requirements
    const speedRequirement = idea.match(/빠른|신속|실시간|real-time|fast/) ? 'fast' : 'balanced';

    // Detect cost constraints
    const costConstraint = idea.match(/저렴|경제적|budget|cost-effective/) ? 'low' : 'flexible';

    return {
      projectType,
      complexity,
      requiredCapabilities,
      speedRequirement,
      costConstraint,
      idea: userIdea
    };
  }

  /**
   * Select best model for a specific role
   */
  selectBestModel(role, analysis) {
    const { requiredCapabilities, speedRequirement, costConstraint, complexity } = analysis;

    // Get all available models
    let candidates = [];
    
    for (const [provider, info] of Object.entries(AI_MODELS)) {
      for (const model of info.models) {
        // Check if model has required capabilities
        const hasCapabilities = requiredCapabilities.every(cap => 
          model.capabilities.includes(cap)
        );

        // Calculate score
        let score = model.rating * 10; // Base score from rating

        // Capability match bonus
        if (hasCapabilities) score += 20;

        // Speed requirement
        if (speedRequirement === 'fast' && model.speed === 'very-fast') score += 15;
        else if (speedRequirement === 'fast' && model.speed === 'fast') score += 10;

        // Cost constraint
        if (costConstraint === 'low' && model.cost === 'low') score += 10;
        else if (costConstraint === 'low' && model.cost === 'medium') score += 5;

        // Complexity adjustment
        if (complexity === 'high' && model.rating >= 4.7) score += 10;

        candidates.push({
          ...model,
          provider,
          score
        });
      }
    }

    // Sort by score
    candidates.sort((a, b) => b.score - a.score);

    // Role-specific filtering
    if (role === 'orchestrator') {
      // Prefer high-rating models with complex-tasks capability
      candidates = candidates.filter(m => 
        m.rating >= 4.7 && m.capabilities.includes('reasoning')
      );
    } else if (role === 'code') {
      // Prefer coding-capable models
      candidates = candidates.filter(m => 
        m.capabilities.includes('coding')
      );
    } else if (role === 'quality') {
      // Prefer fast, economical QA models
      candidates = candidates.filter(m => 
        m.capabilities.includes('qa') || m.capabilities.includes('analysis')
      );
    } else if (role === 'devops') {
      // Prefer fast deployment models
      candidates = candidates.filter(m => 
        m.speed === 'very-fast' || m.speed === 'fast'
      );
    }

    // Return best candidate or default
    const selected = candidates[0];
    
    if (!selected) {
      return this.getDefaultModelForRole(role);
    }

    return {
      id: selected.id,
      name: selected.name,
      provider: selected.provider,
      score: selected.score,
      reason: this.generateSelectionReason(selected, analysis)
    };
  }

  /**
   * Get default model for role
   */
  getDefaultModelForRole(role) {
    const defaults = {
      'orchestrator': {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        reason: '기본 오케스트레이터 모델'
      },
      'code': {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        reason: '기본 코딩 모델'
      },
      'quality': {
        id: 'gpt-4o-mini',
        name: 'GPT-4O Mini',
        provider: 'openai',
        reason: '기본 품질 검증 모델'
      },
      'devops': {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        reason: '기본 DevOps 모델'
      }
    };

    return defaults[role] || defaults['code'];
  }

  /**
   * Generate selection reason
   */
  generateSelectionReason(model, analysis) {
    const reasons = [];

    if (model.rating >= 4.8) {
      reasons.push('최고 평점');
    }

    if (analysis.complexity === 'high' && model.capabilities.includes('complex-tasks')) {
      reasons.push('복잡한 작업 처리 능력');
    }

    if (analysis.speedRequirement === 'fast' && model.speed === 'very-fast') {
      reasons.push('초고속 처리');
    }

    if (model.cost === 'low' && analysis.costConstraint === 'low') {
      reasons.push('경제적');
    }

    return reasons.join(', ') || '종합 평가 최고';
  }

  /**
   * Generate reasoning explanation
   */
  generateReasoning(analysis, models) {
    return {
      projectType: analysis.projectType,
      complexity: analysis.complexity,
      summary: `${analysis.projectType} 프로젝트로 분석되었으며, ${analysis.complexity} 복잡도로 평가되었습니다.`,
      orchestrator: `Master Orchestrator: ${models.orchestrator.name} - ${models.orchestrator.reason}`,
      codeAgent: `Code Agent: ${models.codeAgent.name} - ${models.codeAgent.reason}`,
      qualityAgent: `Quality Agent: ${models.qualityAgent.name} - ${models.qualityAgent.reason}`,
      devopsAgent: `DevOps Agent: ${models.devopsAgent.name} - ${models.devopsAgent.reason}`
    };
  }

  /**
   * Show model selection result modal
   */
  showSelectionModal(result) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';

    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-robot text-purple-600"></i>
              AI 모델 자동 선택 결과
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Master Orchestrator가 프로젝트를 분석하여 최적의 모델을 배정했습니다
            </p>
          </div>
          <button
            onclick="this.closest('.fixed').remove()"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <h3 class="font-bold text-purple-900 mb-2">
            <i class="fas fa-lightbulb mr-2"></i>
            프로젝트 분석
          </h3>
          <p class="text-sm text-purple-800">${result.reasoning.summary}</p>
        </div>

        <div class="space-y-4 mb-6">
          ${this.renderModelCard('Master Orchestrator', result.models.orchestrator, 'purple')}
          ${this.renderModelCard('Code Agent', result.models.codeAgent, 'blue')}
          ${this.renderModelCard('Quality Agent', result.models.qualityAgent, 'green')}
          ${this.renderModelCard('DevOps Agent', result.models.devopsAgent, 'orange')}
        </div>

        <button
          onclick="this.closest('.fixed').remove()"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          <i class="fas fa-check mr-2"></i>
          확인
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Render model card
   */
  renderModelCard(role, model, color) {
    return `
      <div class="border-2 border-${color}-200 rounded-lg p-4 bg-${color}-50">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-${color}-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-robot text-white"></i>
            </div>
            <div>
              <h4 class="font-bold text-${color}-900">${role}</h4>
              <p class="text-xs text-${color}-700">${model.provider}</p>
            </div>
          </div>
          <span class="bg-${color}-200 text-${color}-800 px-3 py-1 rounded-full text-xs font-bold">
            점수: ${model.score?.toFixed(0) || 'N/A'}
          </span>
        </div>
        <div class="mt-2">
          <p class="text-sm font-semibold text-${color}-900">${model.name}</p>
          <p class="text-xs text-${color}-700 mt-1">${model.reason}</p>
        </div>
      </div>
    `;
  }
}

// Create singleton instance
const modelSelector = new ModelSelector();

// Expose to window
if (typeof window !== 'undefined') {
  window.modelSelector = modelSelector;
}

export default modelSelector;

console.log('[Model Selector Module] ✅ Loaded successfully');
