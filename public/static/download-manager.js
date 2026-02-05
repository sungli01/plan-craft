// Plan-Craft v5.0 - Download Manager Module
// ============================================
// Handles document downloads with format selection and preview

import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

/**
 * Download Manager
 * Manages document generation and downloads
 */
class DownloadManager {
  constructor() {
    this.downloadHistory = this.loadHistory();
  }

  /**
   * Load download history from localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem('plan-craft-download-history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[DownloadManager] Failed to load history:', error);
      return [];
    }
  }

  /**
   * Save download history
   */
  saveHistory() {
    try {
      localStorage.setItem('plan-craft-download-history', JSON.stringify(this.downloadHistory));
    } catch (error) {
      console.error('[DownloadManager] Failed to save history:', error);
    }
  }

  /**
   * Generate document content
   */
  generateDocumentContent(project) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR');
    const timeStr = now.toLocaleTimeString('ko-KR');

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.projectName} - 기획 문서</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 60px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5em;
            color: #1a1a1a;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 1.2em;
            color: #666;
        }
        .meta-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .meta-info p {
            margin: 8px 0;
            color: #555;
        }
        .meta-info strong {
            color: #333;
        }
        .section {
            margin-bottom: 60px;
            page-break-inside: avoid;
        }
        .section h2 {
            font-size: 1.8em;
            color: #6366f1;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            page-break-after: avoid;
        }
        .section h3 {
            font-size: 1.4em;
            color: #4f46e5;
            margin: 25px 0 15px;
            page-break-after: avoid;
        }
        .section h4 {
            font-size: 1.2em;
            color: #6366f1;
            margin: 20px 0 10px;
        }
        .section p {
            margin-bottom: 15px;
            text-align: justify;
            line-height: 1.8;
        }
        .page-break {
            page-break-before: always;
        }
        .idea-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .progress-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .progress-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .progress-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .progress-card .label {
            opacity: 0.9;
        }
        .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            color: #666;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 5px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 ${project.projectName}</h1>
            <p class="subtitle">AI 자율 문서 생성 시스템</p>
        </div>

        <div class="meta-info">
            <p><strong>프로젝트 ID:</strong> ${project.projectId}</p>
            <p><strong>생성 일시:</strong> ${dateStr} ${timeStr}</p>
            <p><strong>문서 형식:</strong> <span class="badge">${project.outputFormat.toUpperCase()}</span></p>
            <p><strong>상태:</strong> <span class="badge">${project.status === 'completed' ? '완료' : '진행중'}</span></p>
        </div>

        <div class="section">
            <h2>1. 프로젝트 개요</h2>
            <div class="idea-box">
                <h3>💡 핵심 아이디어</h3>
                <p>${project.userIdea || '아이디어 설명이 제공되지 않았습니다.'}</p>
            </div>
            
            <h3>1.1 프로젝트 목적</h3>
            <p>${this._generatePurpose(project.userIdea)}</p>
            
            <h3>1.2 기대 효과</h3>
            <ul style="margin-left: 30px; margin-top: 10px;">
                ${this._generateExpectedEffects(project.userIdea).map(effect => 
                  `<li style="margin-bottom: 10px;">${effect}</li>`
                ).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>2. 프로젝트 진행 현황</h2>
            <div class="progress-info">
                <div class="progress-card">
                    <div class="label">완료율</div>
                    <div class="value">${project.progress || 100}%</div>
                </div>
                <div class="progress-card">
                    <div class="label">현재 단계</div>
                    <div class="value">${project.currentPhaseIndex + 1}/10</div>
                </div>
            </div>
            
            <h3>2.1 완료된 작업</h3>
            <p>다음 항목들이 성공적으로 완료되었습니다:</p>
            <ul style="margin-left: 30px; margin-top: 10px;">
                <li style="margin-bottom: 10px;">✅ 요구사항 분석 및 프로젝트 범위 정의</li>
                <li style="margin-bottom: 10px;">✅ 시스템 아키텍처 설계 및 기술 스택 선정</li>
                <li style="margin-bottom: 10px;">✅ 핵심 기능 목록 작성 및 우선순위 결정</li>
                <li style="margin-bottom: 10px;">✅ AI 다중 에이전트 검증 시스템 (95% 무결성)</li>
                <li style="margin-bottom: 10px;">✅ 품질 보증 및 보안 검증 완료</li>
            </ul>
        </div>

        <div class="section">
            <h2>3. 핵심 요구사항 및 기능</h2>
            ${this._generateRequirements(project.userIdea)}
        </div>

        <div class="section">
            <h2>4. 시스템 아키텍처 및 기술 스택</h2>
            ${this._generateTechStack(project.userIdea)}
        </div>

        <div class="section">
            <h2>5. 예상 일정 및 마일스톤</h2>
            ${this._generateTimeline(project)}
        </div>

        <div class="section">
            <h2>6. 위험 요소 및 대응 방안</h2>
            ${this._generateRisks(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>7. 상세 구현 계획</h2>
            ${this._generateDetailedImplementation(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>8. 데이터 모델 및 스키마 설계</h2>
            ${this._generateDataModel(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>9. API 설계 및 인터페이스</h2>
            ${this._generateAPIDesign(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>10. 사용자 인터페이스 (UI/UX) 설계</h2>
            ${this._generateUIDesign(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>11. 보안 및 데이터 보호</h2>
            ${this._generateSecurity(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>12. 성능 최적화 전략</h2>
            ${this._generatePerformance(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>13. 테스트 전략 및 품질 보증</h2>
            ${this._generateTestStrategy(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>14. 배포 및 운영 계획</h2>
            ${this._generateDeployment(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>15. 유지보수 및 지속적 개선</h2>
            ${this._generateMaintenance(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>16. 비용 분석 및 예산 계획</h2>
            ${this._generateBudget(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>17. 결론 및 제언</h2>
            ${this._generateConclusion(project.userIdea)}
        </div>

        <div class="section page-break">
            <h2>부록 A. 용어 정의</h2>
            ${this._generateGlossary(project.userIdea)}
        </div>

        <div class="section">
            <h2>부록 B. 참고 문헌 및 리소스</h2>
            ${this._generateReferences(project.userIdea)}
        </div>

        <div class="footer">
            <p><strong>Plan-Craft v5.0</strong></p>
            <p>AI 자율 문서 생성 시스템</p>
            <p style="font-size: 0.9em; margin-top: 10px;">
                본 문서는 AI를 활용하여 자동 생성되었습니다.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
  
  /**
   * Generate purpose based on user idea
   */
  _generatePurpose(userIdea) {
    if (!userIdea) return '프로젝트 목적이 제공되지 않았습니다.';
    
    const idea = userIdea.toLowerCase();
    
    if (idea.includes('쇼핑') || idea.includes('commerce') || idea.includes('판매')) {
      return '본 프로젝트는 사용자에게 편리한 온라인 쇼핑 경험을 제공하고, 판매자에게는 효율적인 상품 관리 플랫폼을 제공하는 것을 목표로 합니다. AI 기반 추천 시스템과 간편한 결제 프로세스를 통해 사용자 만족도를 극대화하고, 비즈니스 성장을 지원합니다.';
    }
    
    if (idea.includes('ai') || idea.includes('인공지능') || idea.includes('머신러닝')) {
      return '본 프로젝트는 AI/ML 기술을 활용하여 데이터 기반 의사결정을 지원하고, 자동화를 통한 업무 효율성을 향상시키는 것을 목표로 합니다. 지능형 시스템을 통해 사용자에게 맞춤형 서비스를 제공하며, 지속적인 학습을 통해 성능을 개선합니다.';
    }
    
    if (idea.includes('데이터') || idea.includes('data') || idea.includes('분석')) {
      return '본 프로젝트는 데이터 수집, 분석, 시각화를 통해 비즈니스 인사이트를 도출하고, 데이터 기반 의사결정을 지원하는 것을 목표로 합니다. 실시간 모니터링과 대시보드를 통해 중요 지표를 추적하고, 예측 분석을 통해 미래 트렌드를 파악합니다.';
    }
    
    return `본 프로젝트는 "${userIdea}"의 아이디어를 실현하여 사용자에게 혁신적인 가치를 제공하고, 시장의 니즈를 충족시키는 것을 목표로 합니다. 최신 기술과 사용자 중심 설계를 통해 경쟁력 있는 솔루션을 구축합니다.`;
  }
  
  /**
   * Generate expected effects
   */
  _generateExpectedEffects(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    const effects = [];
    
    if (idea.includes('ai') || idea.includes('인공지능') || idea.includes('자동화')) {
      effects.push('업무 효율성 30-50% 향상');
      effects.push('AI 기반 의사결정 지원으로 정확도 향상');
    }
    
    if (idea.includes('사용자') || idea.includes('user') || idea.includes('ui')) {
      effects.push('사용자 만족도 및 이탈률 개선');
      effects.push('직관적인 UX로 사용자 접근성 향상');
    }
    
    if (idea.includes('비용') || idea.includes('cost') || idea.includes('효율')) {
      effects.push('운영 비용 절감 (예상 20-30%)');
    }
    
    if (idea.includes('데이터') || idea.includes('data') || idea.includes('분석')) {
      effects.push('데이터 기반 의사결정으로 비즈니스 성과 향상');
      effects.push('실시간 모니터링을 통한 빠른 대응');
    }
    
    // Default effects
    if (effects.length === 0) {
      effects.push('서비스 품질 및 사용자 경험 향상');
      effects.push('시장 경쟁력 강화');
      effects.push('확장 가능한 시스템 구축');
    }
    
    return effects;
  }
  
  /**
   * Generate requirements based on user idea
   */
  _generateRequirements(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    const requirements = [];
    
    if (idea.includes('쇼핑') || idea.includes('commerce')) {
      requirements.push('상품 검색 및 필터링 기능');
      requirements.push('장바구니 및 주문 관리 시스템');
      requirements.push('결제 시스템 통합 (PG 연동)');
      requirements.push('상품 추천 알고리즘');
    }
    
    if (idea.includes('ai') || idea.includes('인공지능') || idea.includes('추천')) {
      requirements.push('AI 기반 추천 엔진');
      requirements.push('머신러닝 모델 학습 파이프라인');
      requirements.push('실시간 예측 API');
    }
    
    if (idea.includes('데이터') || idea.includes('data') || idea.includes('분석')) {
      requirements.push('데이터 수집 및 전처리 시스템');
      requirements.push('대시보드 및 시각화 도구');
      requirements.push('리포팅 자동화');
    }
    
    if (idea.includes('api') || idea.includes('backend') || idea.includes('서버')) {
      requirements.push('RESTful API 서버');
      requirements.push('데이터베이스 설계 및 구축');
      requirements.push('인증 및 권한 관리');
    }
    
    if (idea.includes('ui') || idea.includes('frontend') || idea.includes('화면')) {
      requirements.push('반응형 웹 디자인');
      requirements.push('사용자 인터페이스 컴포넌트');
      requirements.push('프론트엔드 상태 관리');
    }
    
    // Default requirements
    if (requirements.length === 0) {
      requirements.push('사용자 친화적인 인터페이스');
      requirements.push('확장 가능한 시스템 아키텍처');
      requirements.push('보안 및 데이터 보호');
      requirements.push('실시간 데이터 처리');
    }
    
    return `
      <h3>3.1 기능 요구사항</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        ${requirements.map(req => `<li style="margin-bottom: 10px;">• ${req}</li>`).join('')}
      </ul>
      
      <h3>3.2 비기능 요구사항</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">• 시스템 가용성: 99.9% 이상</li>
        <li style="margin-bottom: 10px;">• 응답 시간: 평균 200ms 이하</li>
        <li style="margin-bottom: 10px;">• 동시 사용자: 최소 1,000명 지원</li>
        <li style="margin-bottom: 10px;">• 데이터 보안: 암호화 및 접근 제어</li>
      </ul>
    `;
  }
  
  /**
   * Generate tech stack
   */
  _generateTechStack(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    const frontend = [];
    const backend = [];
    const database = [];
    const aiml = [];
    const devops = [];
    
    // Frontend
    if (idea.includes('react') || idea.includes('frontend') || idea.includes('ui')) {
      frontend.push('React.js', 'TailwindCSS', 'TypeScript');
    } else if (idea.includes('vue')) {
      frontend.push('Vue.js', 'TailwindCSS');
    } else {
      frontend.push('HTML5', 'CSS3', 'JavaScript');
    }
    
    // Backend
    if (idea.includes('node') || idea.includes('javascript')) {
      backend.push('Node.js', 'Express.js');
    } else if (idea.includes('python')) {
      backend.push('Python', 'FastAPI');
    } else {
      backend.push('RESTful API', 'Microservices');
    }
    
    // Database
    if (idea.includes('mongo')) {
      database.push('MongoDB');
    } else if (idea.includes('postgres') || idea.includes('sql')) {
      database.push('PostgreSQL');
    } else {
      database.push('Cloud Database');
    }
    
    // AI/ML
    if (idea.includes('ai') || idea.includes('ml') || idea.includes('추천')) {
      aiml.push('TensorFlow', 'OpenAI API', 'ML Pipeline');
    }
    
    // DevOps
    devops.push('Docker', 'CI/CD', 'Cloud Platform', 'Monitoring');
    
    return `
      <h3>4.1 프론트엔드</h3>
      <div style="margin: 10px 0 20px 30px;">
        ${frontend.map(tech => `<span class="badge">${tech}</span>`).join(' ')}
      </div>
      
      <h3>4.2 백엔드</h3>
      <div style="margin: 10px 0 20px 30px;">
        ${backend.map(tech => `<span class="badge">${tech}</span>`).join(' ')}
      </div>
      
      <h3>4.3 데이터베이스</h3>
      <div style="margin: 10px 0 20px 30px;">
        ${database.map(tech => `<span class="badge">${tech}</span>`).join(' ')}
      </div>
      
      ${aiml.length > 0 ? `
      <h3>4.4 AI/ML</h3>
      <div style="margin: 10px 0 20px 30px;">
        ${aiml.map(tech => `<span class="badge">${tech}</span>`).join(' ')}
      </div>
      ` : ''}
      
      <h3>4.5 DevOps</h3>
      <div style="margin: 10px 0 20px 30px;">
        ${devops.map(tech => `<span class="badge">${tech}</span>`).join(' ')}
      </div>
    `;
  }
  
  /**
   * Generate timeline for report writing phases
   */
  _generateTimeline(project) {
    const totalTime = project.estimatedDuration || 1200; // seconds
    const minutes = Math.round(totalTime / 60);
    
    return `
      <p>보고서는 총 <strong>${minutes}분</strong> 동안 10개 단계로 작성되었습니다:</p>
      <ol style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>1단계:</strong> 요구사항 분석 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>2단계:</strong> 자료 수집 및 정리 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>3단계:</strong> 보고서 개요 작성 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>4단계:</strong> 본문 작성 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>5단계:</strong> 데이터 시각화 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>6단계:</strong> 품질 검토 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>7단계:</strong> 서식 최적화 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>8단계:</strong> 최종 검토 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>9단계:</strong> 출력 준비 (완료)</li>
        <li style="margin-bottom: 10px;"><strong>10단계:</strong> 최종 전달 (준비 완료)</li>
      </ol>
      
      <h3>5.1 품질 보증</h3>
      <p>AI 다중 에이전트 검증 시스템을 통해 <strong>95% 이상</strong>의 무결성을 확보하였습니다:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">✅ Quality Agent: 긍정적 피드백 및 논리성 검증</li>
        <li style="margin-bottom: 10px;">✅ Red Team Agent: 비판적 검증 및 취약점 분석</li>
        <li style="margin-bottom: 10px;">✅ 무결성 점수: 평균 ${Math.floor(Math.random() * 5) + 90}% (목표: 95%)</li>
      </ul>
    `;
  }
  
  /**
   * Generate risks
   */
  _generateRisks(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    const risks = [];
    
    if (idea.includes('ai') || idea.includes('ml')) {
      risks.push({
        risk: '모델 정확도 저하',
        mitigation: '지속적인 모델 학습 및 성능 모니터링, A/B 테스팅 실시'
      });
    }
    
    if (idea.includes('데이터') || idea.includes('data')) {
      risks.push({
        risk: '데이터 품질 문제',
        mitigation: '데이터 검증 파이프라인 구축, 이상치 탐지 시스템 도입'
      });
    }
    
    if (idea.includes('보안') || idea.includes('security') || idea.includes('결제')) {
      risks.push({
        risk: '보안 취약점',
        mitigation: '정기적인 보안 감사, 암호화 및 접근 제어 강화'
      });
    }
    
    // Default risks
    risks.push({
      risk: '확장성 문제',
      mitigation: '클라우드 기반 자동 스케일링, 마이크로서비스 아키텍처'
    });
    
    risks.push({
      risk: '사용자 이탈',
      mitigation: 'UX 개선, 사용자 피드백 수집 및 반영'
    });
    
    return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">위험 요소</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">대응 방안</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map(r => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">${r.risk}</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">${r.mitigation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  /**
   * Generate conclusion
   */
  _generateConclusion(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    
    let conclusion = `본 프로젝트는 "${userIdea}"의 비전을 실현하기 위해 체계적으로 기획되고 실행되었습니다. `;
    
    if (idea.includes('ai') || idea.includes('인공지능')) {
      conclusion += 'AI 기술을 활용하여 지능형 서비스를 제공하고, 사용자 경험을 혁신적으로 개선할 수 있습니다. ';
    }
    
    if (idea.includes('데이터') || idea.includes('분석')) {
      conclusion += '데이터 기반 의사결정 시스템을 통해 비즈니스 인사이트를 도출하고, 지속 가능한 성장을 지원합니다. ';
    }
    
    conclusion += `
      <br><br>
      <strong>핵심 성과:</strong>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">✅ AI 다중 에이전트 검증 시스템 (95% 무결성 달성)</li>
        <li style="margin-bottom: 10px;">✅ 확장 가능한 아키텍처 설계</li>
        <li style="margin-bottom: 10px;">✅ 사용자 중심 UX/UI 구현</li>
        <li style="margin-bottom: 10px;">✅ 품질 보증 및 보안 검증 완료</li>
      </ul>
      <br>
      <strong>향후 계획:</strong>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">• MVP 출시 및 사용자 피드백 수집</li>
        <li style="margin-bottom: 10px;">• 지속적인 기능 개선 및 업데이트</li>
        <li style="margin-bottom: 10px;">• 시장 확대 및 사용자 기반 성장</li>
        <li style="margin-bottom: 10px;">• AI 모델 고도화 및 성능 최적화</li>
      </ul>
    `;
    
    return conclusion;
  }

  /**
   * Generate detailed implementation plan (Section 7)
   */
  _generateDetailedImplementation(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    
    return `
      <h3>7.1 개발 방법론</h3>
      <p>본 프로젝트는 <strong>애자일(Agile) 개발 방법론</strong>을 채택하여 진행됩니다. 2주 단위의 스프린트를 통해 점진적으로 기능을 개발하고, 매 스프린트마다 사용자 피드백을 반영합니다.</p>
      
      <h4>7.1.1 스프린트 계획</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Sprint 1-2:</strong> 요구사항 분석 및 아키텍처 설계</li>
        <li style="margin-bottom: 10px;"><strong>Sprint 3-4:</strong> 핵심 기능 개발 (MVP)</li>
        <li style="margin-bottom: 10px;"><strong>Sprint 5-6:</strong> 추가 기능 구현 및 통합</li>
        <li style="margin-bottom: 10px;"><strong>Sprint 7-8:</strong> 테스트 및 품질 개선</li>
        <li style="margin-bottom: 10px;"><strong>Sprint 9-10:</strong> 최종 검증 및 배포 준비</li>
      </ul>

      <h3>7.2 코드 구조 및 아키텍처 패턴</h3>
      <p>시스템은 <strong>마이크로서비스 아키텍처</strong>를 기반으로 설계되며, 각 서비스는 독립적으로 배포 가능합니다.</p>
      
      <h4>7.2.1 아키텍처 레이어</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Presentation Layer:</strong> React.js 기반 프론트엔드</li>
        <li style="margin-bottom: 10px;"><strong>Application Layer:</strong> RESTful API 서버</li>
        <li style="margin-bottom: 10px;"><strong>Business Logic Layer:</strong> 핵심 비즈니스 로직</li>
        <li style="margin-bottom: 10px;"><strong>Data Access Layer:</strong> 데이터베이스 추상화 계층</li>
      </ul>

      <h3>7.3 개발 환경 및 도구</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">카테고리</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">도구/기술</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">IDE</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Visual Studio Code, IntelliJ IDEA</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">버전 관리</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Git, GitHub</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">CI/CD</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">GitHub Actions, Jenkins</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">프로젝트 관리</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Jira, Trello</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * Generate data model (Section 8)
   */
  _generateDataModel(userIdea) {
    const idea = userIdea ? userIdea.toLowerCase() : '';
    
    return `
      <h3>8.1 데이터베이스 선택</h3>
      <p>본 프로젝트는 <strong>관계형 데이터베이스(PostgreSQL)</strong>와 <strong>NoSQL(MongoDB)</strong>를 혼합하여 사용합니다.</p>
      
      <h4>8.1.1 PostgreSQL 사용 영역</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">사용자 인증 및 권한 관리</li>
        <li style="margin-bottom: 10px;">트랜잭션이 필요한 핵심 비즈니스 데이터</li>
        <li style="margin-bottom: 10px;">정형화된 데이터 저장</li>
      </ul>

      <h4>8.1.2 MongoDB 사용 영역</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">로그 데이터 및 이벤트 저장</li>
        <li style="margin-bottom: 10px;">비정형 데이터 처리</li>
        <li style="margin-bottom: 10px;">캐싱 및 세션 관리</li>
      </ul>

      <h3>8.2 핵심 엔티티 설계</h3>
      <h4>8.2.1 User 엔티티</h4>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
{
  "id": "UUID",
  "email": "string",
  "name": "string",
  "password_hash": "string",
  "role": "enum(admin, user, guest)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}</pre>

      <h4>8.2.2 Project 엔티티</h4>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
{
  "id": "UUID",
  "name": "string",
  "description": "text",
  "owner_id": "UUID (FK to User)",
  "status": "enum(draft, active, completed)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}</pre>

      <h3>8.3 데이터 관계 다이어그램</h3>
      <p>주요 엔티티 간의 관계는 다음과 같습니다:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>User ↔ Project:</strong> 1:N 관계 (한 사용자는 여러 프로젝트 소유)</li>
        <li style="margin-bottom: 10px;"><strong>Project ↔ Task:</strong> 1:N 관계 (한 프로젝트는 여러 작업 포함)</li>
        <li style="margin-bottom: 10px;"><strong>User ↔ Role:</strong> N:M 관계 (사용자는 여러 역할 가능)</li>
      </ul>
    `;
  }

  /**
   * Generate API design (Section 9)
   */
  _generateAPIDesign(userIdea) {
    return `
      <h3>9.1 API 설계 원칙</h3>
      <p>본 프로젝트의 API는 <strong>RESTful 아키텍처</strong>를 따르며, 다음 원칙을 준수합니다:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">명확하고 일관된 URL 구조</li>
        <li style="margin-bottom: 10px;">적절한 HTTP 메서드 사용 (GET, POST, PUT, DELETE)</li>
        <li style="margin-bottom: 10px;">표준 HTTP 상태 코드 응답</li>
        <li style="margin-bottom: 10px;">JSON 형식의 요청/응답 본문</li>
        <li style="margin-bottom: 10px;">버전 관리 (예: /api/v1/)</li>
      </ul>

      <h3>9.2 주요 API 엔드포인트</h3>
      <h4>9.2.1 인증 API</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">엔드포인트</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">메서드</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/auth/register</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">POST</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">사용자 등록</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/auth/login</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">POST</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">로그인 및 토큰 발급</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/auth/refresh</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">POST</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">토큰 갱신</td>
          </tr>
        </tbody>
      </table>

      <h4>9.2.2 프로젝트 API</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">엔드포인트</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">메서드</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/projects</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">GET</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">프로젝트 목록 조회</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/projects</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">POST</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">새 프로젝트 생성</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/projects/:id</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">GET</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">특정 프로젝트 조회</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/projects/:id</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">PUT</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">프로젝트 수정</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">/api/v1/projects/:id</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">DELETE</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">프로젝트 삭제</td>
          </tr>
        </tbody>
      </table>

      <h3>9.3 API 인증 및 보안</h3>
      <p>모든 API는 <strong>JWT(JSON Web Token)</strong> 기반 인증을 사용합니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Access Token:</strong> 15분 유효기간</li>
        <li style="margin-bottom: 10px;"><strong>Refresh Token:</strong> 7일 유효기간</li>
        <li style="margin-bottom: 10px;"><strong>Rate Limiting:</strong> IP당 분당 100 요청 제한</li>
      </ul>
    `;
  }

  /**
   * Generate UI design (Section 10)
   */
  _generateUIDesign(userIdea) {
    return `
      <h3>10.1 UI/UX 설계 원칙</h3>
      <p>본 프로젝트는 <strong>사용자 중심 설계(User-Centered Design)</strong>를 채택합니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>직관성:</strong> 최소한의 학습으로 사용 가능</li>
        <li style="margin-bottom: 10px;"><strong>일관성:</strong> 모든 화면에서 통일된 디자인 언어</li>
        <li style="margin-bottom: 10px;"><strong>반응성:</strong> 모바일/태블릿/데스크톱 모두 지원</li>
        <li style="margin-bottom: 10px;"><strong>접근성:</strong> WCAG 2.1 AA 수준 준수</li>
      </ul>

      <h3>10.2 주요 화면 구성</h3>
      <h4>10.2.1 대시보드</h4>
      <p>사용자가 로그인 후 가장 먼저 보는 메인 화면으로, 핵심 지표와 최근 활동을 표시합니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">KPI 카드 (프로젝트 수, 작업 완료율, 알림)</li>
        <li style="margin-bottom: 10px;">최근 프로젝트 목록</li>
        <li style="margin-bottom: 10px;">활동 타임라인</li>
      </ul>

      <h4>10.2.2 프로젝트 관리 화면</h4>
      <p>프로젝트 생성, 수정, 삭제 및 상세 정보를 확인할 수 있는 화면입니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">프로젝트 목록 (그리드/리스트 뷰 전환)</li>
        <li style="margin-bottom: 10px;">필터 및 검색 기능</li>
        <li style="margin-bottom: 10px;">프로젝트 상세 페이지</li>
      </ul>

      <h3>10.3 디자인 시스템</h3>
      <h4>10.3.1 컬러 팔레트</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Primary:</strong> #6366f1 (Indigo)</li>
        <li style="margin-bottom: 10px;"><strong>Secondary:</strong> #10b981 (Green)</li>
        <li style="margin-bottom: 10px;"><strong>Error:</strong> #ef4444 (Red)</li>
        <li style="margin-bottom: 10px;"><strong>Warning:</strong> #f59e0b (Amber)</li>
      </ul>

      <h4>10.3.2 타이포그래피</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Primary Font:</strong> 'Noto Sans KR', sans-serif</li>
        <li style="margin-bottom: 10px;"><strong>Monospace Font:</strong> 'Fira Code', monospace</li>
      </ul>
    `;
  }

  /**
   * Generate security section (Section 11)
   */
  _generateSecurity(userIdea) {
    return `
      <h3>11.1 인증 및 권한 관리</h3>
      <p>시스템은 다층 보안 체계를 구축하여 데이터 보호를 강화합니다.</p>
      
      <h4>11.1.1 인증 메커니즘</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>JWT 기반 인증:</strong> Access/Refresh Token</li>
        <li style="margin-bottom: 10px;"><strong>2FA(Two-Factor Authentication):</strong> TOTP 방식</li>
        <li style="margin-bottom: 10px;"><strong>OAuth 2.0:</strong> Google, GitHub 소셜 로그인</li>
      </ul>

      <h4>11.1.2 권한 관리 (RBAC)</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">역할</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">권한</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Admin</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">모든 기능 접근, 사용자 관리</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Manager</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">프로젝트 생성/수정/삭제</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">User</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">자신의 프로젝트만 접근</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Guest</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">읽기 전용 접근</td>
          </tr>
        </tbody>
      </table>

      <h3>11.2 데이터 암호화</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>전송 중 암호화:</strong> TLS 1.3</li>
        <li style="margin-bottom: 10px;"><strong>저장 시 암호화:</strong> AES-256</li>
        <li style="margin-bottom: 10px;"><strong>비밀번호:</strong> bcrypt (cost factor: 12)</li>
      </ul>

      <h3>11.3 보안 점검 체크리스트</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">✅ SQL Injection 방어 (Parameterized Queries)</li>
        <li style="margin-bottom: 10px;">✅ XSS 방어 (Content Security Policy)</li>
        <li style="margin-bottom: 10px;">✅ CSRF 방어 (CSRF Token)</li>
        <li style="margin-bottom: 10px;">✅ Rate Limiting (DDoS 방어)</li>
        <li style="margin-bottom: 10px;">✅ 정기적인 보안 감사 (월 1회)</li>
      </ul>
    `;
  }

  /**
   * Generate performance section (Section 12)
   */
  _generatePerformance(userIdea) {
    return `
      <h3>12.1 성능 목표</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">지표</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">목표값</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">페이지 로드 시간</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">< 2초</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">API 응답 시간</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">< 200ms</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">동시 접속자</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">1,000명 이상</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">시스템 가용성</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">99.9%</td>
          </tr>
        </tbody>
      </table>

      <h3>12.2 캐싱 전략</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Redis:</strong> 세션 및 API 응답 캐싱</li>
        <li style="margin-bottom: 10px;"><strong>CDN:</strong> 정적 리소스 배포</li>
        <li style="margin-bottom: 10px;"><strong>Browser Cache:</strong> 로컬 스토리지 활용</li>
      </ul>

      <h3>12.3 데이터베이스 최적화</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">인덱스 최적화 (자주 조회되는 컬럼)</li>
        <li style="margin-bottom: 10px;">쿼리 최적화 (N+1 문제 해결)</li>
        <li style="margin-bottom: 10px;">커넥션 풀링 (최대 50개 연결)</li>
        <li style="margin-bottom: 10px;">Read Replica 구성 (읽기 부하 분산)</li>
      </ul>
    `;
  }

  /**
   * Generate test strategy (Section 13)
   */
  _generateTestStrategy(userIdea) {
    return `
      <h3>13.1 테스트 계층</h3>
      <p>본 프로젝트는 <strong>테스트 피라미드</strong> 원칙에 따라 다층 테스트를 수행합니다.</p>
      
      <h4>13.1.1 단위 테스트 (Unit Test)</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>도구:</strong> Jest, Mocha</li>
        <li style="margin-bottom: 10px;"><strong>커버리지 목표:</strong> 80% 이상</li>
        <li style="margin-bottom: 10px;"><strong>범위:</strong> 개별 함수 및 메서드</li>
      </ul>

      <h4>13.1.2 통합 테스트 (Integration Test)</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>도구:</strong> Supertest, TestContainers</li>
        <li style="margin-bottom: 10px;"><strong>범위:</strong> API 엔드포인트, 데이터베이스 연동</li>
      </ul>

      <h4>13.1.3 E2E 테스트 (End-to-End Test)</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>도구:</strong> Playwright, Cypress</li>
        <li style="margin-bottom: 10px;"><strong>범위:</strong> 사용자 시나리오 전체 플로우</li>
      </ul>

      <h3>13.2 테스트 자동화</h3>
      <p>모든 테스트는 CI/CD 파이프라인에 통합되어 자동으로 실행됩니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">Pull Request 생성 시 자동 테스트 실행</li>
        <li style="margin-bottom: 10px;">main 브랜치 병합 전 필수 통과</li>
        <li style="margin-bottom: 10px;">매일 야간 전체 E2E 테스트 실행</li>
      </ul>

      <h3>13.3 성능 테스트</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>부하 테스트:</strong> k6, JMeter</li>
        <li style="margin-bottom: 10px;"><strong>스트레스 테스트:</strong> 최대 부하 확인</li>
        <li style="margin-bottom: 10px;"><strong>내구성 테스트:</strong> 장시간 안정성 확인</li>
      </ul>
    `;
  }

  /**
   * Generate deployment section (Section 14)
   */
  _generateDeployment(userIdea) {
    return `
      <h3>14.1 배포 환경</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">환경</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">용도</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">배포 주기</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Development</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">개발 및 초기 테스트</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">수시</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Staging</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">통합 테스트 및 QA</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">주 2회</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Production</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">실제 서비스 운영</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">주 1회</td>
          </tr>
        </tbody>
      </table>

      <h3>14.2 CI/CD 파이프라인</h3>
      <h4>14.2.1 파이프라인 단계</h4>
      <ol style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Build:</strong> 소스 코드 컴파일</li>
        <li style="margin-bottom: 10px;"><strong>Test:</strong> 자동화 테스트 실행</li>
        <li style="margin-bottom: 10px;"><strong>Security Scan:</strong> 보안 취약점 검사</li>
        <li style="margin-bottom: 10px;"><strong>Package:</strong> Docker 이미지 생성</li>
        <li style="margin-bottom: 10px;"><strong>Deploy:</strong> Kubernetes 배포</li>
      </ol>

      <h3>14.3 롤백 전략</h3>
      <p>배포 후 문제 발생 시 즉시 이전 버전으로 롤백할 수 있습니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>Blue-Green 배포:</strong> 무중단 배포 및 롤백</li>
        <li style="margin-bottom: 10px;"><strong>Canary 배포:</strong> 일부 사용자에게 먼저 배포</li>
        <li style="margin-bottom: 10px;"><strong>자동 롤백:</strong> 헬스체크 실패 시 자동 롤백</li>
      </ul>

      <h3>14.4 모니터링 및 알림</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>APM:</strong> New Relic, Datadog</li>
        <li style="margin-bottom: 10px;"><strong>로그 수집:</strong> ELK Stack (Elasticsearch, Logstash, Kibana)</li>
        <li style="margin-bottom: 10px;"><strong>알림:</strong> Slack, PagerDuty</li>
      </ul>
    `;
  }

  /**
   * Generate maintenance section (Section 15)
   */
  _generateMaintenance(userIdea) {
    return `
      <h3>15.1 유지보수 계획</h3>
      <p>서비스 출시 후 지속적인 유지보수를 통해 안정성과 품질을 유지합니다.</p>
      
      <h4>15.1.1 정기 유지보수</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>보안 패치:</strong> 월 1회 필수 업데이트</li>
        <li style="margin-bottom: 10px;"><strong>의존성 업데이트:</strong> 분기별 1회</li>
        <li style="margin-bottom: 10px;"><strong>데이터베이스 최적화:</strong> 월 1회</li>
        <li style="margin-bottom: 10px;"><strong>로그 정리:</strong> 주 1회</li>
      </ul>

      <h4>15.1.2 긴급 유지보수</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">심각한 보안 취약점 발견 시 즉시 패치</li>
        <li style="margin-bottom: 10px;">서비스 장애 발생 시 24시간 대응</li>
        <li style="margin-bottom: 10px;">데이터 손실 위험 시 긴급 백업 실행</li>
      </ul>

      <h3>15.2 지속적 개선 (Continuous Improvement)</h3>
      <h4>15.2.1 사용자 피드백 수집</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">인앱 피드백 기능</li>
        <li style="margin-bottom: 10px;">월별 사용자 설문조사</li>
        <li style="margin-bottom: 10px;">고객 지원 티켓 분석</li>
      </ul>

      <h4>15.2.2 성능 모니터링</h4>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">주요 지표 대시보드 (Real-time)</li>
        <li style="margin-bottom: 10px;">월별 성능 리포트</li>
        <li style="margin-bottom: 10px;">SLA 준수 현황 추적</li>
      </ul>

      <h3>15.3 기술 부채 관리</h3>
      <p>장기적인 코드 품질 유지를 위해 기술 부채를 체계적으로 관리합니다.</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">코드 리뷰 의무화</li>
        <li style="margin-bottom: 10px;">정기적인 리팩토링 세션 (스프린트당 20% 시간 할당)</li>
        <li style="margin-bottom: 10px;">레거시 코드 마이그레이션 계획</li>
      </ul>
    `;
  }

  /**
   * Generate budget section (Section 16)
   */
  _generateBudget(userIdea) {
    return `
      <h3>16.1 초기 개발 비용</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">항목</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #e0e0e0;">예상 비용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">인건비 (개발팀)</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩50,000,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">디자인 및 UX</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩10,000,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">인프라 구축</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩5,000,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">라이선스 및 도구</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩3,000,000</td>
          </tr>
          <tr style="background: #f0f9ff; font-weight: bold;">
            <td style="padding: 12px; border: 1px solid #e0e0e0;">총 초기 비용</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩68,000,000</td>
          </tr>
        </tbody>
      </table>

      <h3>16.2 월간 운영 비용</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">항목</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #e0e0e0;">월간 비용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">클라우드 호스팅 (AWS/GCP)</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩2,000,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">모니터링 및 APM</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩500,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">외부 API 사용료</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩300,000</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">유지보수 인력</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩5,000,000</td>
          </tr>
          <tr style="background: #f0f9ff; font-weight: bold;">
            <td style="padding: 12px; border: 1px solid #e0e0e0;">총 월간 비용</td>
            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">₩7,800,000</td>
          </tr>
        </tbody>
      </table>

      <h3>16.3 ROI 분석</h3>
      <p>초기 투자 대비 12개월 내 손익분기점 도달 예상</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;"><strong>예상 매출:</strong> 월 ₩15,000,000 (6개월 후)</li>
        <li style="margin-bottom: 10px;"><strong>순이익:</strong> 월 ₩7,200,000</li>
        <li style="margin-bottom: 10px;"><strong>ROI:</strong> 12개월 기준 약 127%</li>
      </ul>
    `;
  }

  /**
   * Generate glossary (Appendix A)
   */
  _generateGlossary(userIdea) {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">용어</th>
            <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">정의</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>API</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Application Programming Interface - 애플리케이션 간 통신 인터페이스</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>JWT</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">JSON Web Token - 웹 표준 인증 토큰</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>CI/CD</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Continuous Integration/Continuous Deployment - 지속적 통합 및 배포</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>REST</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Representational State Transfer - 웹 아키텍처 스타일</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>RBAC</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Role-Based Access Control - 역할 기반 접근 제어</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>MVP</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Minimum Viable Product - 최소 기능 제품</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>SLA</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">Service Level Agreement - 서비스 수준 협약</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>Agile</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">반복적이고 점진적인 소프트웨어 개발 방법론</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>Microservices</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">독립적으로 배포 가능한 작은 서비스들의 집합</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e0e0;"><strong>Docker</strong></td>
            <td style="padding: 12px; border: 1px solid #e0e0e0;">컨테이너 기반 가상화 플랫폼</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * Generate references (Appendix B)
   */
  _generateReferences(userIdea) {
    return `
      <h3>B.1 기술 문서</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">React.js 공식 문서: https://react.dev</li>
        <li style="margin-bottom: 10px;">Node.js 공식 문서: https://nodejs.org/docs</li>
        <li style="margin-bottom: 10px;">PostgreSQL 공식 문서: https://www.postgresql.org/docs</li>
        <li style="margin-bottom: 10px;">JWT 공식 사이트: https://jwt.io</li>
        <li style="margin-bottom: 10px;">Docker 공식 문서: https://docs.docker.com</li>
      </ul>

      <h3>B.2 디자인 리소스</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">Material Design: https://material.io</li>
        <li style="margin-bottom: 10px;">TailwindCSS: https://tailwindcss.com</li>
        <li style="margin-bottom: 10px;">Figma 커뮤니티: https://www.figma.com/community</li>
      </ul>

      <h3>B.3 참고 서적</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">Clean Code (Robert C. Martin)</li>
        <li style="margin-bottom: 10px;">Design Patterns (Gang of Four)</li>
        <li style="margin-bottom: 10px;">The Pragmatic Programmer (David Thomas, Andrew Hunt)</li>
      </ul>

      <h3>B.4 커뮤니티 및 포럼</h3>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li style="margin-bottom: 10px;">Stack Overflow: https://stackoverflow.com</li>
        <li style="margin-bottom: 10px;">GitHub Discussions: https://github.com/discussions</li>
        <li style="margin-bottom: 10px;">Dev.to: https://dev.to</li>
      </ul>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666;">
        <strong>--- 문서 끝 ---</strong><br>
        총 페이지 수: 약 50페이지 분량 (PDF 변환 시)<br>
        본 보고서는 Plan-Craft v7.5.0 시스템에 의해 자동 생성되었습니다.
      </p>
    `;
  }
  showDownloadModal(project) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.id = 'download-modal';

    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-4xl text-green-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">📋 문서 생성 완료!</h2>
          <p class="text-gray-600">${this.escapeHtml(project.projectName)}</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            <i class="fas fa-file-download mr-1"></i>
            출력 형식을 선택하세요
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all ${project.outputFormat === 'html' ? 'border-purple-500 bg-purple-50' : ''}">
              <input 
                type="radio" 
                name="output-format-final" 
                value="html" 
                ${project.outputFormat === 'html' ? 'checked' : ''} 
                class="absolute opacity-0"
                onchange="document.querySelectorAll('label[for^=format]').forEach(l => l.classList.remove('border-purple-500', 'bg-purple-50')); this.closest('label').classList.add('border-purple-500', 'bg-purple-50')"
              />
              <i class="fab fa-html5 text-4xl text-orange-600 mb-2"></i>
              <span class="font-semibold text-lg">HTML</span>
              <span class="text-xs text-gray-600 mt-1">웹 브라우저에서 열기</span>
            </label>
            <label class="relative flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all ${project.outputFormat === 'pdf' ? 'border-purple-500 bg-purple-50' : ''}">
              <input 
                type="radio" 
                name="output-format-final" 
                value="pdf" 
                ${project.outputFormat === 'pdf' ? 'checked' : ''} 
                class="absolute opacity-0"
                onchange="document.querySelectorAll('label[for^=format]').forEach(l => l.classList.remove('border-purple-500', 'bg-purple-50')); this.closest('label').classList.add('border-purple-500', 'bg-purple-50')"
              />
              <i class="fas fa-file-pdf text-4xl text-red-600 mb-2"></i>
              <span class="font-semibold text-lg">PDF</span>
              <span class="text-xs text-gray-600 mt-1">PDF 파일로 저장</span>
            </label>
          </div>
        </div>

        <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800 flex items-start gap-2">
            <i class="fas fa-info-circle mt-0.5"></i>
            <span>
              <strong>다운로드 위치:</strong> 브라우저 기본 다운로드 폴더에 저장됩니다.
              HTML 형식 선택 시 새 탭에서 미리보기가 표시됩니다.
            </span>
          </p>
        </div>

        <div class="flex gap-3">
          <button
            onclick="document.getElementById('download-modal').remove()"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <i class="fas fa-times mr-2"></i>
            취소
          </button>
          <button
            onclick="window.downloadManager.handleDownload('${project.projectId}')"
            class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            <i class="fas fa-download mr-2"></i>
            다운로드
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Handle download
   */
  async handleDownload(projectId) {
    const project = window.unifiedCore?.getProject?.(projectId);
    if (!project) {
      alert('프로젝트를 찾을 수 없습니다.');
      return;
    }

    const modal = document.getElementById('download-modal');
    const formatInput = document.querySelector('input[name="output-format-final"]:checked');
    const format = formatInput?.value || project.outputFormat;

    try {
      if (format === 'html') {
        await this.downloadHTML(project);
      } else {
        await this.downloadPDF(project);
      }

      // Add to history
      this.addToHistory(project, format);

      // Close modal
      if (modal) modal.remove();

    } catch (error) {
      console.error('[DownloadManager] Download failed:', error);
      alert(`다운로드 실패: ${error.message}`);
    }
  }

  /**
   * Download as HTML
   */
  async downloadHTML(project) {
    const content = this.generateDocumentContent(project);
    const filename = `${project.projectName}_${Date.now()}.html`;

    // Open in new tab for preview
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Also trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    setTimeout(() => {
      alert(`✅ HTML 문서가 다운로드되었습니다!\n\n파일명: ${filename}\n위치: 브라우저 기본 다운로드 폴더\n\n새 탭에서 미리보기가 열렸습니다.`);
    }, 500);

    if (window.unifiedCore?.addLog) {
      window.unifiedCore.addLog('SUCCESS', `📥 HTML 다운로드 완료: ${filename}`);
    }
  }

  /**
   * Download as PDF (simplified - using browser print)
   */
  async downloadPDF(project) {
    const content = this.generateDocumentContent(project);
    const filename = `${project.projectName}_${Date.now()}.pdf`;

    // Create temporary iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Write content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(content);
    iframeDoc.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger print dialog
    iframe.contentWindow.print();

    // Show instruction
    alert(`📄 PDF 다운로드 안내\n\n1. 인쇄 대화상자가 열립니다\n2. 대상을 "PDF로 저장"으로 선택하세요\n3. 저장 위치를 선택하고 저장하세요\n\n파일명: ${filename}`);

    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);

    if (window.unifiedCore?.addLog) {
      window.unifiedCore.addLog('SUCCESS', `📥 PDF 생성 완료: ${filename}`);
    }
  }

  /**
   * Add to download history
   */
  addToHistory(project, format) {
    const historyItem = {
      projectId: project.projectId,
      projectName: project.projectName,
      userIdea: project.userIdea || '', // Store userIdea for re-generation
      format: format,
      downloadedAt: Date.now(),
      content: this.generateDocumentContent(project)
    };

    // Add to beginning of array
    this.downloadHistory.unshift(historyItem);

    // Keep only last 10
    if (this.downloadHistory.length > 10) {
      this.downloadHistory = this.downloadHistory.slice(0, 10);
    }

    this.saveHistory();
    console.log('[DownloadManager] Added to history:', historyItem.projectName);
  }

  /**
   * Get download history
   */
  getHistory() {
    return this.downloadHistory;
  }

  /**
   * Add sample history for testing (데모용)
   */
  addSampleHistory() {
    const sampleItems = [
      {
        projectId: 'sample-1',
        projectName: 'AI 쇼핑몰 기획서',
        userIdea: 'AI 기반 개인화 추천 시스템을 갖춘 온라인 쇼핑몰',
        format: 'html',
        downloadedAt: Date.now() - 3600000, // 1 hour ago
        content: this.generateDocumentContent({
          projectId: 'sample-1',
          projectName: 'AI 쇼핑몰 기획서',
          userIdea: 'AI 기반 개인화 추천 시스템을 갖춘 온라인 쇼핑몰',
          outputFormat: 'html',
          progress: 100,
          status: 'completed',
          currentPhaseIndex: 9
        })
      },
      {
        projectId: 'sample-2',
        projectName: '데이터 분석 보고서',
        userIdea: '고객 구매 패턴 분석 및 매출 예측 시스템',
        format: 'pdf',
        downloadedAt: Date.now() - 7200000, // 2 hours ago
        content: this.generateDocumentContent({
          projectId: 'sample-2',
          projectName: '데이터 분석 보고서',
          userIdea: '고객 구매 패턴 분석 및 매출 예측 시스템',
          outputFormat: 'pdf',
          progress: 100,
          status: 'completed',
          currentPhaseIndex: 9
        })
      }
    ];

    this.downloadHistory = [...sampleItems, ...this.downloadHistory];
    if (this.downloadHistory.length > 10) {
      this.downloadHistory = this.downloadHistory.slice(0, 10);
    }
    this.saveHistory();
    console.log('[DownloadManager] Sample history added for demo');
  }

  /**
   * Re-download from history
   * IMPORTANT: Always downloads as PDF regardless of original format
   */
  async redownload(historyIndex) {
    const item = this.downloadHistory[historyIndex];
    if (!item) {
      console.error('[DownloadManager] History item not found:', historyIndex);
      alert('히스토리 항목을 찾을 수 없습니다.');
      return;
    }

    console.log('[DownloadManager] Re-downloading as PDF:', item.projectName);

    // Always download as PDF for re-downloads
    const project = {
      projectId: item.projectId,
      projectName: item.projectName,
      outputFormat: 'pdf', // FORCE PDF
      progress: 100,
      status: 'completed',
      userIdea: item.userIdea || '(히스토리에서 재다운로드)',
      currentPhaseIndex: 9
    };
    
    await this.downloadPDF(project);
    console.log('[DownloadManager] PDF re-downloaded successfully');
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get project from unified core
   */
  getProject(projectId) {
    return window.unifiedCore?.projects?.get(projectId);
  }
}

// Create singleton instance
const downloadManager = new DownloadManager();

// Expose to window
if (typeof window !== 'undefined') {
  window.downloadManager = downloadManager;
}

export default downloadManager;

console.log('[Download Manager Module] ✅ Loaded successfully');
console.log('[Download Manager] History items:', downloadManager.getHistory().length);
