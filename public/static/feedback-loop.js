/**
 * Plan-Craft v5.0 - Multi-Agent Feedback Loop System
 * 
 * 멀티 에이전트 협업 및 피드백 루프
 * - Quality Agent: 긍정적 피드백 (논리성, 완전성, 명확성)
 * - Red Team Agent: 부정적 피드백 (보안, 확장성, 비용)
 * - 95% 무결성 목표 달성까지 반복
 */

class MultiAgentFeedbackLoop {
  constructor() {
    this.agents = {
      quality: {
        name: 'Quality Agent',
        model: 'gpt-5o-mini',
        role: 'positive',
        description: '논리 검증 및 긍정적 피드백 제공'
      },
      redteam: {
        name: 'Red Team Agent',
        model: 'claude-sonnet-4',
        role: 'negative',
        description: '비판적 검증 및 부정적 피드백 제공'
      }
    };

    this.feedbackHistory = [];
    this.integrityThreshold = 95; // 95% 무결성 목표
    this.maxRounds = 5; // 최대 피드백 라운드
  }

  /**
   * 피드백 라운드 실행
   * @param {Object} content - 검증할 콘텐츠
   * @param {number} roundNumber - 라운드 번호
   * @returns {Promise<Object>} 피드백 결과
   */
  async executeFeedbackRound(content, roundNumber) {
    const timestamp = new Date().toISOString();
    const roundId = `round_${roundNumber}_${Date.now()}`;

    console.log(`\n[Feedback Loop] Round ${roundNumber} 시작`);

    try {
      // Quality Agent 피드백 (긍정)
      const qualityFeedback = await this._getQualityAgentFeedback(content, roundNumber);
      
      // Red Team Agent 피드백 (부정)
      const redTeamFeedback = await this._getRedTeamAgentFeedback(content, roundNumber);

      // 무결성 스코어 계산
      const integrityScore = this._calculateIntegrityScore(qualityFeedback, redTeamFeedback);

      const roundResult = {
        roundId,
        roundNumber,
        timestamp,
        qualityFeedback,
        redTeamFeedback,
        integrityScore,
        passed: integrityScore.overall >= this.integrityThreshold,
        recommendations: this._generateRecommendations(qualityFeedback, redTeamFeedback, integrityScore)
      };

      this.feedbackHistory.push(roundResult);

      console.log(`[Feedback Loop] Round ${roundNumber} 완료`);
      console.log(`[Feedback Loop] 무결성 스코어: ${integrityScore.overall}%`);
      console.log(`[Feedback Loop] 통과: ${roundResult.passed ? '✅' : '❌'}\n`);

      return roundResult;

    } catch (error) {
      console.error(`[Feedback Loop] Round ${roundNumber} 실패:`, error);
      return {
        roundId,
        roundNumber,
        timestamp,
        error: error.message,
        passed: false
      };
    }
  }

  /**
   * 전체 피드백 루프 실행 (95% 달성까지)
   * @param {Object} initialContent - 초기 콘텐츠
   * @returns {Promise<Object>} 최종 결과
   */
  async runUntilIntegrityAchieved(initialContent) {
    console.log(`\n[Feedback Loop] 전체 프로세스 시작`);
    console.log(`[Feedback Loop] 목표: ${this.integrityThreshold}% 무결성\n`);

    let currentContent = { ...initialContent };
    let roundNumber = 1;
    const allRounds = [];

    while (roundNumber <= this.maxRounds) {
      const roundResult = await this.executeFeedbackRound(currentContent, roundNumber);
      allRounds.push(roundResult);

      if (roundResult.passed) {
        console.log(`\n[Feedback Loop] ✅ 목표 달성! (Round ${roundNumber})`);
        console.log(`[Feedback Loop] 최종 무결성: ${roundResult.integrityScore.overall}%\n`);
        
        return {
          status: 'success',
          totalRounds: roundNumber,
          finalScore: roundResult.integrityScore.overall,
          allRounds,
          finalContent: currentContent
        };
      }

      // 개선 사항 적용 (시뮬레이션)
      currentContent = this._applyImprovements(currentContent, roundResult.recommendations);
      roundNumber++;
    }

    console.log(`\n[Feedback Loop] ⚠️ 최대 라운드 도달 (${this.maxRounds}회)`);
    console.log(`[Feedback Loop] 최종 무결성: ${allRounds[allRounds.length - 1].integrityScore.overall}%\n`);

    return {
      status: 'max_rounds_reached',
      totalRounds: this.maxRounds,
      finalScore: allRounds[allRounds.length - 1].integrityScore.overall,
      allRounds,
      finalContent: currentContent
    };
  }

  /**
   * 피드백 히스토리 조회
   * @param {number} limit - 조회 개수
   * @returns {Array} 피드백 히스토리
   */
  getFeedbackHistory(limit = 10) {
    return this.feedbackHistory.slice(-limit);
  }

  /**
   * 특정 라운드 결과 조회
   * @param {string} roundId - 라운드 ID
   * @returns {Object|null} 라운드 결과
   */
  getRoundResult(roundId) {
    return this.feedbackHistory.find(r => r.roundId === roundId) || null;
  }

  /**
   * 히스토리 초기화
   */
  clearHistory() {
    this.feedbackHistory = [];
    console.log('[Feedback Loop] 히스토리 초기화 완료');
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * Quality Agent 피드백 생성 (긍정적)
   */
  async _getQualityAgentFeedback(content, roundNumber) {
    // 실제 구현 시: OpenAI API 호출
    // const feedback = await openaiAPI.chat({
    //   model: 'gpt-5o-mini',
    //   messages: [
    //     { role: 'system', content: 'You are a quality assurance agent...' },
    //     { role: 'user', content: JSON.stringify(content) }
    //   ]
    // });

    // 현재는 시뮬레이션
    await this._simulateDelay(500);

    const baseScores = {
      completeness: 70 + (roundNumber - 1) * 10,
      accuracy: 75 + (roundNumber - 1) * 8,
      clarity: 72 + (roundNumber - 1) * 9,
      consistency: 78 + (roundNumber - 1) * 7,
      practicality: 68 + (roundNumber - 1) * 12
    };

    // 100점 제한
    Object.keys(baseScores).forEach(key => {
      baseScores[key] = Math.min(100, baseScores[key]);
    });

    return {
      agent: 'Quality Agent',
      model: 'gpt-5o-mini',
      role: 'positive',
      scores: baseScores,
      comments: [
        {
          category: 'completeness',
          score: baseScores.completeness,
          comment: roundNumber === 1 
            ? '기본 요구사항은 충족하나 상세 설명이 부족합니다.'
            : '모든 요구사항이 충족되었습니다.'
        },
        {
          category: 'accuracy',
          score: baseScores.accuracy,
          comment: roundNumber === 1
            ? '사실 관계는 대체로 정확하나 일부 검증이 필요합니다.'
            : '사실 관계가 정확하고 신뢰할 수 있습니다.'
        },
        {
          category: 'clarity',
          score: baseScores.clarity,
          comment: roundNumber === 1
            ? '전체적으로 이해 가능하나 일부 모호한 표현이 있습니다.'
            : '명확하고 이해하기 쉽게 작성되었습니다.'
        },
        {
          category: 'consistency',
          score: baseScores.consistency,
          comment: '논리적 모순이 없고 일관성이 유지됩니다.'
        },
        {
          category: 'practicality',
          score: baseScores.practicality,
          comment: roundNumber === 1
            ? '실행 가능하나 구체적인 실행 계획이 보완되어야 합니다.'
            : '실행 가능성이 높고 구체적인 계획이 포함되었습니다.'
        }
      ],
      overallAssessment: roundNumber >= 3 
        ? '대부분의 기준을 충족하며 높은 품질을 보입니다.'
        : '개선이 필요한 부분이 있으나 기본적인 품질은 확보되었습니다.'
    };
  }

  /**
   * Red Team Agent 피드백 생성 (부정적)
   */
  async _getRedTeamAgentFeedback(content, roundNumber) {
    // 실제 구현 시: Claude API 호출
    // const feedback = await claudeAPI.chat({
    //   model: 'claude-sonnet-4',
    //   messages: [
    //     { role: 'system', content: 'You are a red team agent...' },
    //     { role: 'user', content: JSON.stringify(content) }
    //   ]
    // });

    // 현재는 시뮬레이션
    await this._simulateDelay(600);

    const basePenalties = {
      security: roundNumber === 1 ? -15 : (roundNumber === 2 ? -8 : -2),
      scalability: roundNumber === 1 ? -12 : (roundNumber === 2 ? -5 : -1),
      cost: roundNumber === 1 ? -10 : (roundNumber === 2 ? -4 : -1),
      maintenance: roundNumber === 1 ? -8 : (roundNumber === 2 ? -3 : 0),
      compliance: roundNumber === 1 ? -5 : (roundNumber === 2 ? -2 : 0)
    };

    return {
      agent: 'Red Team Agent',
      model: 'claude-sonnet-4',
      role: 'negative',
      penalties: basePenalties,
      issues: [
        {
          category: 'security',
          severity: roundNumber === 1 ? 'high' : (roundNumber === 2 ? 'medium' : 'low'),
          penalty: basePenalties.security,
          description: roundNumber === 1
            ? '보안 취약점: 인증/인가 메커니즘이 명시되지 않음'
            : roundNumber === 2
            ? '보안 고려: API 키 관리 전략이 추가되었으나 세부 사항 필요'
            : '보안: 모든 주요 보안 요소가 적절히 다뤄짐'
        },
        {
          category: 'scalability',
          severity: roundNumber === 1 ? 'medium' : (roundNumber === 2 ? 'low' : 'none'),
          penalty: basePenalties.scalability,
          description: roundNumber === 1
            ? '확장성 문제: 트래픽 증가 시 대응 전략 부재'
            : roundNumber === 2
            ? '확장성: 로드 밸런싱이 언급되었으나 구체적 설계 필요'
            : '확장성: 적절한 확장 전략이 포함됨'
        },
        {
          category: 'cost',
          severity: roundNumber === 1 ? 'medium' : (roundNumber === 2 ? 'low' : 'none'),
          penalty: basePenalties.cost,
          description: roundNumber === 1
            ? '비용 분석 부족: 운영 비용 추정이 없음'
            : roundNumber === 2
            ? '비용: 대략적 추정이 추가되었으나 세부 항목 필요'
            : '비용: 현실적인 비용 분석 포함'
        },
        {
          category: 'maintenance',
          severity: roundNumber === 1 ? 'low' : 'none',
          penalty: basePenalties.maintenance,
          description: roundNumber === 1
            ? '유지보수: 코드 복잡도 및 기술 부채 고려 필요'
            : '유지보수: 적절한 모니터링 및 로깅 전략 포함'
        },
        {
          category: 'compliance',
          severity: roundNumber === 1 ? 'low' : 'none',
          penalty: basePenalties.compliance,
          description: roundNumber === 1
            ? '규정 준수: 데이터 보호 규정(GDPR 등) 언급 필요'
            : '규정 준수: 주요 규정이 고려됨'
        }
      ],
      overallAssessment: roundNumber >= 3
        ? '대부분의 문제가 해결되었으며 실행 가능합니다.'
        : '여러 개선 사항이 필요하며 추가 작업이 요구됩니다.'
    };
  }

  /**
   * 무결성 스코어 계산
   */
  _calculateIntegrityScore(qualityFeedback, redTeamFeedback) {
    // Quality Agent 점수 평균
    const qualityScores = qualityFeedback.scores;
    const qualityAverage = Object.values(qualityScores).reduce((a, b) => a + b, 0) / Object.keys(qualityScores).length;

    // Red Team Agent 페널티 합계
    const penalties = redTeamFeedback.penalties;
    const totalPenalty = Object.values(penalties).reduce((a, b) => a + b, 0);

    // 최종 무결성 스코어
    const overallScore = Math.max(0, Math.min(100, qualityAverage + totalPenalty));

    return {
      quality: {
        average: Math.round(qualityAverage * 100) / 100,
        breakdown: qualityScores
      },
      redTeam: {
        totalPenalty: Math.round(totalPenalty * 100) / 100,
        breakdown: penalties
      },
      overall: Math.round(overallScore * 100) / 100,
      passed: overallScore >= this.integrityThreshold,
      breakdown: {
        qualityContribution: qualityAverage,
        penaltyImpact: totalPenalty,
        final: overallScore
      }
    };
  }

  /**
   * 개선 권장사항 생성
   */
  _generateRecommendations(qualityFeedback, redTeamFeedback, integrityScore) {
    const recommendations = [];

    // Quality Agent 개선 사항
    qualityFeedback.comments.forEach(comment => {
      if (comment.score < 90) {
        recommendations.push({
          source: 'Quality Agent',
          category: comment.category,
          priority: comment.score < 70 ? 'high' : 'medium',
          suggestion: comment.comment,
          currentScore: comment.score,
          targetScore: 95
        });
      }
    });

    // Red Team Agent 개선 사항
    redTeamFeedback.issues.forEach(issue => {
      if (issue.severity !== 'none') {
        recommendations.push({
          source: 'Red Team Agent',
          category: issue.category,
          priority: issue.severity === 'high' ? 'high' : (issue.severity === 'medium' ? 'medium' : 'low'),
          suggestion: issue.description,
          penalty: issue.penalty
        });
      }
    });

    // 우선순위 정렬
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return recommendations;
  }

  /**
   * 개선사항 적용 (시뮬레이션)
   */
  _applyImprovements(content, recommendations) {
    // 실제 구현 시: 각 권장사항에 따라 콘텐츠 수정
    // 현재는 버전만 증가
    return {
      ...content,
      version: (content.version || 1) + 1,
      improvementsApplied: recommendations.map(r => ({
        category: r.category,
        priority: r.priority
      }))
    };
  }

  /**
   * 지연 시뮬레이션
   */
  _simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton 인스턴스
const feedbackLoop = new MultiAgentFeedbackLoop();

// 브라우저 환경에서 전역 노출
if (typeof window !== 'undefined') {
  window.feedbackLoop = feedbackLoop;
}

// Export
export default feedbackLoop;

console.log('[Multi-Agent Feedback Loop] ✅ 모듈 로드 완료');
