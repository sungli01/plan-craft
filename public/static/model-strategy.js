/**
 * Plan-Craft v5.0 Model Strategy
 * 
 * Purpose: Intelligent model selection based on task requirements
 * - Agent-specific model assignment (SYSTEM_PERSONA.md v5.0 spec)
 * - Cost/performance optimization
 * - Fallback strategies
 * - Context window management
 */

export class ModelStrategy {
  constructor(llmClient) {
    this.llmClient = llmClient;
    
    // Agent-to-Model mapping based on Plan-Craft v5.0 spec
    this.agentModelMapping = {
      'Master Orchestrator': {
        primary: 'gpt-4o',
        fallback: ['claude-3.5-sonnet', 'gemini-1.5-pro'],
        reasoning: '전략적 의사결정 및 전체 조율에 최적화'
      },
      'Code Agent': {
        primary: 'gpt-4o',
        fallback: ['claude-3.5-sonnet', 'gpt-4o-mini'],
        reasoning: '코드 생성 및 기술 설계에 강점'
      },
      'Quality Agent': {
        primary: 'gpt-4o-mini',
        fallback: ['gemini-2.0-flash', 'gpt-4o'],
        reasoning: '논리 검증 및 긍정 피드백, 비용 효율적'
      },
      'Red Team Agent': {
        primary: 'claude-3.5-sonnet',
        fallback: ['gpt-4o', 'gemini-1.5-pro'],
        reasoning: '비판적 분석 및 레드팀 검증에 강점'
      },
      'DevOps Agent': {
        primary: 'gemini-2.0-flash',
        fallback: ['gpt-4o-mini', 'claude-3.5-sonnet'],
        reasoning: '배포 자동화, 빠른 응답 필요'
      },
      'Business Analyst': {
        primary: 'gpt-4o',
        fallback: ['claude-3.5-sonnet', 'gemini-1.5-pro'],
        reasoning: '비즈니스 분석 및 전략 수립'
      },
      'Strategy Agent': {
        primary: 'claude-3.5-sonnet',
        fallback: ['gpt-4o', 'gemini-1.5-pro'],
        reasoning: '전략적 사고 및 장기 계획'
      },
      'Risk Manager': {
        primary: 'claude-3.5-sonnet',
        fallback: ['gpt-4o', 'gemini-1.5-pro'],
        reasoning: '리스크 분석 및 대응 방안'
      },
      'Requirements Agent': {
        primary: 'gpt-4o',
        fallback: ['claude-3.5-sonnet', 'gpt-4o-mini'],
        reasoning: '요구사항 분석 및 문서화'
      },
      'Resource Manager': {
        primary: 'gpt-4o-mini',
        fallback: ['gemini-2.0-flash', 'gpt-4o'],
        reasoning: '리소스 계획, 비용 효율적'
      }
    };

    // Task complexity levels
    this.complexityLevels = {
      'simple': {
        models: ['gpt-4o-mini', 'gemini-2.0-flash'],
        maxTokens: 2048,
        description: '간단한 작업 (요약, 번역 등)'
      },
      'moderate': {
        models: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4o-mini'],
        maxTokens: 4096,
        description: '중간 난이도 작업 (분석, 설계 등)'
      },
      'complex': {
        models: ['gpt-4o', 'claude-3.5-sonnet'],
        maxTokens: 8192,
        description: '복잡한 작업 (전략 수립, 아키텍처 설계 등)'
      },
      'very-complex': {
        models: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro'],
        maxTokens: 16384,
        description: '매우 복잡한 작업 (대규모 시스템 설계 등)'
      }
    };

    // Budget constraints
    this.budgetMode = 'balanced'; // 'economy', 'balanced', 'performance'
  }

  /**
   * Select best model for agent
   */
  selectModelForAgent(agentName, taskComplexity = 'moderate', contextSize = 0) {
    console.log(`[ModelStrategy] Selecting model for ${agentName} (complexity: ${taskComplexity}, context: ${contextSize} tokens)...`);

    const agentConfig = this.agentModelMapping[agentName];
    if (!agentConfig) {
      console.warn(`[ModelStrategy] Unknown agent ${agentName}, using default`);
      return this.selectDefaultModel(taskComplexity, contextSize);
    }

    // Get primary model
    let selectedModel = agentConfig.primary;
    let modelInfo = this.llmClient.getModelInfo(selectedModel);

    // Check context window
    if (contextSize > modelInfo.contextWindow * 0.8) {
      console.warn(`[ModelStrategy] Context size ${contextSize} too large for ${selectedModel}, trying fallback...`);
      
      // Try fallback models
      for (const fallback of agentConfig.fallback) {
        const fallbackInfo = this.llmClient.getModelInfo(fallback);
        if (contextSize <= fallbackInfo.contextWindow * 0.8) {
          selectedModel = fallback;
          modelInfo = fallbackInfo;
          console.log(`[ModelStrategy] Using fallback model: ${fallback}`);
          break;
        }
      }
    }

    // Apply budget constraints
    if (this.budgetMode === 'economy') {
      const economyModel = this.findCheaperAlternative(selectedModel, taskComplexity);
      if (economyModel) {
        console.log(`[ModelStrategy] Budget mode: switching to ${economyModel}`);
        selectedModel = economyModel;
      }
    }

    console.log(`[ModelStrategy] Selected model: ${selectedModel} (${agentConfig.reasoning})`);

    return {
      modelId: selectedModel,
      agentName,
      reasoning: agentConfig.reasoning,
      maxTokens: this.complexityLevels[taskComplexity]?.maxTokens || 4096
    };
  }

  /**
   * Select default model based on task complexity
   */
  selectDefaultModel(taskComplexity, contextSize = 0) {
    const complexity = this.complexityLevels[taskComplexity] || this.complexityLevels['moderate'];
    
    // Find suitable model
    for (const modelId of complexity.models) {
      const modelInfo = this.llmClient.getModelInfo(modelId);
      if (contextSize <= modelInfo.contextWindow * 0.8) {
        return {
          modelId,
          agentName: 'Unknown',
          reasoning: complexity.description,
          maxTokens: complexity.maxTokens
        };
      }
    }

    // If no model fits, use the one with largest context window
    return {
      modelId: 'gemini-1.5-pro',
      agentName: 'Unknown',
      reasoning: 'Large context required',
      maxTokens: complexity.maxTokens
    };
  }

  /**
   * Find cheaper alternative model
   */
  findCheaperAlternative(modelId, taskComplexity) {
    const currentModel = this.llmClient.getModelInfo(modelId);
    if (!currentModel) return null;

    const complexity = this.complexityLevels[taskComplexity];
    if (!complexity) return null;

    // Find cheaper models in the same complexity level
    for (const alternativeId of complexity.models) {
      if (alternativeId === modelId) continue;
      
      const alternative = this.llmClient.getModelInfo(alternativeId);
      
      // Compare pricing (input + output average)
      const currentCost = (currentModel.pricing.input + currentModel.pricing.output) / 2;
      const alternativeCost = (alternative.pricing.input + alternative.pricing.output) / 2;
      
      if (alternativeCost < currentCost) {
        return alternativeId;
      }
    }

    return null;
  }

  /**
   * Select model for section based on content type
   */
  selectModelForSection(sectionTitle, sectionSubtitle, estimatedTokens) {
    console.log(`[ModelStrategy] Selecting model for section: ${sectionTitle}`);

    // Analyze section requirements
    let agentName = 'Master Orchestrator';
    let complexity = 'moderate';

    // Technical sections
    if (sectionTitle.includes('기술') || sectionTitle.includes('아키텍처') || sectionTitle.includes('스택')) {
      agentName = 'Code Agent';
      complexity = 'complex';
    }
    // Business analysis sections
    else if (sectionTitle.includes('시장') || sectionTitle.includes('분석') || sectionTitle.includes('전략')) {
      agentName = 'Business Analyst';
      complexity = 'complex';
    }
    // Risk management sections
    else if (sectionTitle.includes('리스크') || sectionTitle.includes('위험')) {
      agentName = 'Risk Manager';
      complexity = 'moderate';
    }
    // Requirements sections
    else if (sectionTitle.includes('요구사항') || sectionTitle.includes('기능')) {
      agentName = 'Requirements Agent';
      complexity = 'moderate';
    }
    // Timeline/schedule sections
    else if (sectionTitle.includes('일정') || sectionTitle.includes('마일스톤') || sectionTitle.includes('로드맵')) {
      agentName = 'DevOps Agent';
      complexity = 'simple';
    }

    return this.selectModelForAgent(agentName, complexity, estimatedTokens);
  }

  /**
   * Batch model selection for multiple sections
   */
  selectModelsForDocument(tableOfContents) {
    console.log(`[ModelStrategy] Selecting models for ${tableOfContents.length} sections...`);

    const selections = tableOfContents.map(section => {
      const estimatedTokens = this.estimateContextSize(section);
      const selection = this.selectModelForSection(
        section.title,
        section.subtitle,
        estimatedTokens
      );

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        ...selection
      };
    });

    // Optimize for cost
    if (this.budgetMode === 'economy') {
      selections.forEach(selection => {
        const cheaper = this.findCheaperAlternative(selection.modelId, 'moderate');
        if (cheaper) {
          selection.originalModel = selection.modelId;
          selection.modelId = cheaper;
          selection.optimized = true;
        }
      });
    }

    console.log(`[ModelStrategy] Model selection complete:`, selections);
    return selections;
  }

  /**
   * Estimate context size for a section
   */
  estimateContextSize(section) {
    // Rough estimate based on section content
    let estimate = 500; // Base system prompt

    // Section title and subtitle
    estimate += this.llmClient.estimateTokens(section.title + ' ' + section.subtitle);

    // Add buffer for RAG references
    estimate += 1000;

    // Add buffer for examples and context
    if (section.priority === 'critical') {
      estimate += 2000;
    } else if (section.priority === 'high') {
      estimate += 1000;
    }

    return estimate;
  }

  /**
   * Set budget mode
   */
  setBudgetMode(mode) {
    if (!['economy', 'balanced', 'performance'].includes(mode)) {
      throw new Error(`Invalid budget mode: ${mode}`);
    }
    this.budgetMode = mode;
    console.log(`[ModelStrategy] Budget mode set to: ${mode}`);
  }

  /**
   * Get budget mode
   */
  getBudgetMode() {
    return this.budgetMode;
  }

  /**
   * Get agent model mapping
   */
  getAgentModelMapping() {
    return this.agentModelMapping;
  }

  /**
   * Get recommended model for quick tasks
   */
  getQuickTaskModel() {
    return this.budgetMode === 'performance' ? 'gpt-4o' : 'gpt-4o-mini';
  }

  /**
   * Get recommended model for complex reasoning
   */
  getComplexReasoningModel() {
    return this.budgetMode === 'economy' ? 'gpt-4o-mini' : 'gpt-4o';
  }

  /**
   * Export strategy data
   */
  exportData() {
    return {
      budgetMode: this.budgetMode,
      agentModelMapping: this.agentModelMapping,
      complexityLevels: this.complexityLevels
    };
  }
}

// Make globally available
window.ModelStrategy = ModelStrategy;

console.log('[ModelStrategy] Module loaded successfully');
