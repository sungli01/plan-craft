/**
 * Plan-Craft v5.0 - Integrity Score Engine
 * 
 * 무결성 스코어 계산 및 요구사항 추적 엔진
 * - 요구사항별 준수율 계산
 * - 정량적 평가 시스템
 * - 실시간 스코어 업데이트
 */

class IntegrityScoreEngine {
  constructor() {
    this.requirements = new Map();
    this.scoreHistory = [];
    this.weightingScheme = {
      completeness: 0.25,    // 완전성 25%
      accuracy: 0.25,        // 정확성 25%
      clarity: 0.15,         // 명확성 15%
      consistency: 0.15,     // 일관성 15%
      practicality: 0.20     // 실용성 20%
    };
  }

  /**
   * 요구사항 등록
   * @param {string} id - 요구사항 ID
   * @param {Object} requirement - 요구사항 정보
   */
  registerRequirement(id, requirement) {
    this.requirements.set(id, {
      id,
      title: requirement.title,
      description: requirement.description,
      priority: requirement.priority || 'medium', // high, medium, low
      category: requirement.category || 'general',
      weight: requirement.weight || 1.0,
      complianceScore: 0,
      status: 'pending', // pending, in_progress, completed
      evidence: [],
      registeredAt: new Date().toISOString()
    });

    console.log(`[Integrity Engine] 요구사항 등록: ${id} - ${requirement.title}`);
  }

  /**
   * 요구사항 준수 평가
   * @param {string} requirementId - 요구사항 ID
   * @param {Object} evidence - 증거 자료
   * @returns {Object} 평가 결과
   */
  assessCompliance(requirementId, evidence) {
    const requirement = this.requirements.get(requirementId);
    
    if (!requirement) {
      console.error(`[Integrity Engine] 요구사항 없음: ${requirementId}`);
      return { error: 'Requirement not found' };
    }

    // 준수율 계산 (0-100)
    const complianceScore = this._calculateComplianceScore(requirement, evidence);

    // 요구사항 업데이트
    requirement.complianceScore = complianceScore;
    requirement.status = complianceScore >= 95 ? 'completed' : 'in_progress';
    requirement.evidence.push({
      timestamp: new Date().toISOString(),
      score: complianceScore,
      ...evidence
    });

    this.requirements.set(requirementId, requirement);

    console.log(`[Integrity Engine] 요구사항 평가: ${requirementId} - ${complianceScore}%`);

    return {
      requirementId,
      title: requirement.title,
      complianceScore,
      status: requirement.status,
      passed: complianceScore >= 95
    };
  }

  /**
   * 전체 무결성 스코어 계산
   * @returns {Object} 전체 스코어 및 세부 사항
   */
  calculateOverallScore() {
    const requirements = Array.from(this.requirements.values());

    if (requirements.length === 0) {
      return {
        overall: 0,
        totalRequirements: 0,
        breakdown: {},
        message: '등록된 요구사항이 없습니다.'
      };
    }

    // 카테고리별 그룹화
    const byCategory = this._groupByCategory(requirements);

    // 우선순위별 가중치
    const priorityWeights = {
      high: 1.5,
      medium: 1.0,
      low: 0.7
    };

    // 전체 점수 계산
    let totalWeightedScore = 0;
    let totalWeight = 0;

    requirements.forEach(req => {
      const priorityWeight = priorityWeights[req.priority] || 1.0;
      const weight = req.weight * priorityWeight;
      totalWeightedScore += req.complianceScore * weight;
      totalWeight += weight;
    });

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // 통과/미달 요구사항 분류
    const passed = requirements.filter(r => r.complianceScore >= 95);
    const failed = requirements.filter(r => r.complianceScore < 95);

    const scoreData = {
      overall: Math.round(overallScore * 100) / 100,
      totalRequirements: requirements.length,
      passed: passed.length,
      failed: failed.length,
      passRate: Math.round((passed.length / requirements.length) * 100 * 100) / 100,
      byCategory,
      byPriority: this._groupByPriority(requirements),
      topIssues: this._identifyTopIssues(failed),
      timestamp: new Date().toISOString()
    };

    // 히스토리 저장
    this.scoreHistory.push(scoreData);

    console.log(`[Integrity Engine] 전체 스코어: ${scoreData.overall}%`);
    console.log(`[Integrity Engine] 통과율: ${scoreData.passRate}% (${passed.length}/${requirements.length})`);

    return scoreData;
  }

  /**
   * 요구사항별 준수율 보고서 생성
   * @returns {Object} 상세 보고서
   */
  generateComplianceReport() {
    const overallScore = this.calculateOverallScore();
    const requirements = Array.from(this.requirements.values());

    const report = {
      summary: {
        overallScore: overallScore.overall,
        totalRequirements: overallScore.totalRequirements,
        passedCount: overallScore.passed,
        failedCount: overallScore.failed,
        passRate: overallScore.passRate,
        targetScore: 95,
        achieved: overallScore.overall >= 95
      },
      byCategory: overallScore.byCategory,
      byPriority: overallScore.byPriority,
      detailedRequirements: requirements.map(req => ({
        id: req.id,
        title: req.title,
        priority: req.priority,
        category: req.category,
        complianceScore: req.complianceScore,
        status: req.status,
        passed: req.complianceScore >= 95,
        gap: Math.max(0, 95 - req.complianceScore),
        evidenceCount: req.evidence.length
      })).sort((a, b) => a.complianceScore - b.complianceScore), // 낮은 점수부터
      recommendations: this._generateImprovementRecommendations(requirements),
      generatedAt: new Date().toISOString()
    };

    console.log(`\n[Integrity Engine] === 준수율 보고서 ===`);
    console.log(`전체 스코어: ${report.summary.overallScore}%`);
    console.log(`통과율: ${report.summary.passRate}%`);
    console.log(`통과/전체: ${report.summary.passedCount}/${report.summary.totalRequirements}`);
    console.log(`목표 달성: ${report.summary.achieved ? '✅' : '❌'}\n`);

    return report;
  }

  /**
   * 실시간 스코어 업데이트 (이벤트 기반)
   * @param {Function} callback - 스코어 변경 시 호출될 콜백
   */
  watchScore(callback) {
    // 실제 구현 시: 이벤트 리스너 등록
    this._scoreWatcher = callback;
    console.log('[Integrity Engine] 실시간 스코어 감시 시작');
  }

  /**
   * 스코어 히스토리 조회
   * @param {number} limit - 조회 개수
   * @returns {Array} 히스토리 목록
   */
  getScoreHistory(limit = 10) {
    return this.scoreHistory.slice(-limit);
  }

  /**
   * 특정 요구사항 조회
   * @param {string} requirementId - 요구사항 ID
   * @returns {Object|null} 요구사항 정보
   */
  getRequirement(requirementId) {
    return this.requirements.get(requirementId) || null;
  }

  /**
   * 모든 요구사항 조회
   * @param {Object} filters - 필터 옵션
   * @returns {Array} 요구사항 목록
   */
  getAllRequirements(filters = {}) {
    let requirements = Array.from(this.requirements.values());

    if (filters.category) {
      requirements = requirements.filter(r => r.category === filters.category);
    }

    if (filters.priority) {
      requirements = requirements.filter(r => r.priority === filters.priority);
    }

    if (filters.status) {
      requirements = requirements.filter(r => r.status === filters.status);
    }

    return requirements;
  }

  /**
   * 초기화
   */
  reset() {
    this.requirements.clear();
    this.scoreHistory = [];
    console.log('[Integrity Engine] 초기화 완료');
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * 준수율 계산
   */
  _calculateComplianceScore(requirement, evidence) {
    // 실제 구현 시: 복잡한 평가 로직
    // 현재는 간단한 시뮬레이션
    
    const baseScore = evidence.score || 0;
    const evidenceQuality = evidence.quality || 1.0; // 0.0 - 1.0
    const completeness = evidence.completeness || 0.8; // 0.0 - 1.0

    // 가중치 적용
    const finalScore = baseScore * evidenceQuality * completeness;

    return Math.min(100, Math.max(0, finalScore));
  }

  /**
   * 카테고리별 그룹화
   */
  _groupByCategory(requirements) {
    const grouped = {};

    requirements.forEach(req => {
      if (!grouped[req.category]) {
        grouped[req.category] = {
          category: req.category,
          count: 0,
          averageScore: 0,
          requirements: []
        };
      }

      grouped[req.category].count++;
      grouped[req.category].requirements.push({
        id: req.id,
        title: req.title,
        score: req.complianceScore
      });
    });

    // 평균 점수 계산
    Object.keys(grouped).forEach(category => {
      const reqs = grouped[category].requirements;
      const total = reqs.reduce((sum, r) => sum + r.score, 0);
      grouped[category].averageScore = Math.round((total / reqs.length) * 100) / 100;
    });

    return grouped;
  }

  /**
   * 우선순위별 그룹화
   */
  _groupByPriority(requirements) {
    const grouped = {
      high: { count: 0, averageScore: 0, requirements: [] },
      medium: { count: 0, averageScore: 0, requirements: [] },
      low: { count: 0, averageScore: 0, requirements: [] }
    };

    requirements.forEach(req => {
      grouped[req.priority].count++;
      grouped[req.priority].requirements.push({
        id: req.id,
        title: req.title,
        score: req.complianceScore
      });
    });

    // 평균 점수 계산
    ['high', 'medium', 'low'].forEach(priority => {
      const reqs = grouped[priority].requirements;
      if (reqs.length > 0) {
        const total = reqs.reduce((sum, r) => sum + r.score, 0);
        grouped[priority].averageScore = Math.round((total / reqs.length) * 100) / 100;
      }
    });

    return grouped;
  }

  /**
   * 주요 문제 식별
   */
  _identifyTopIssues(failedRequirements) {
    return failedRequirements
      .sort((a, b) => a.complianceScore - b.complianceScore)
      .slice(0, 5)
      .map(req => ({
        id: req.id,
        title: req.title,
        priority: req.priority,
        category: req.category,
        currentScore: req.complianceScore,
        targetScore: 95,
        gap: 95 - req.complianceScore
      }));
  }

  /**
   * 개선 권장사항 생성
   */
  _generateImprovementRecommendations(requirements) {
    const failed = requirements.filter(r => r.complianceScore < 95);

    if (failed.length === 0) {
      return [{
        priority: 'none',
        message: '모든 요구사항이 목표를 달성했습니다. ✅'
      }];
    }

    const recommendations = [];

    // 우선순위 high 요구사항 중 미달
    const highPriorityFailed = failed.filter(r => r.priority === 'high');
    if (highPriorityFailed.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'high_priority_requirements',
        count: highPriorityFailed.length,
        message: `${highPriorityFailed.length}개의 높은 우선순위 요구사항이 목표 미달입니다.`,
        requirements: highPriorityFailed.map(r => r.id)
      });
    }

    // 카테고리별 평균이 낮은 경우
    const byCategory = this._groupByCategory(requirements);
    Object.keys(byCategory).forEach(category => {
      if (byCategory[category].averageScore < 85) {
        recommendations.push({
          priority: 'high',
          category: `category_${category}`,
          averageScore: byCategory[category].averageScore,
          message: `'${category}' 카테고리의 평균 점수가 낮습니다 (${byCategory[category].averageScore}%).`,
          requirements: byCategory[category].requirements.map(r => r.id)
        });
      }
    });

    // 전체적인 개선 방향
    if (failed.length > requirements.length * 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'overall',
        message: `전체 요구사항의 ${Math.round((failed.length / requirements.length) * 100)}%가 목표 미달입니다. 전반적인 품질 향상이 필요합니다.`
      });
    }

    return recommendations;
  }
}

// Singleton 인스턴스
const integrityEngine = new IntegrityScoreEngine();

// 브라우저 환경에서 전역 노출
if (typeof window !== 'undefined') {
  window.integrityEngine = integrityEngine;
}

// Export
export default integrityEngine;

console.log('[Integrity Score Engine] ✅ 모듈 로드 완료');
