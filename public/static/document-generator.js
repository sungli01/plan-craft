/**
 * Plan-Craft v5.0 Document Generator
 * 
 * Purpose: Generate professional reports following Plan-Craft v5.0 specifications
 * - First page: Plan-Craft v5.0 summary layout
 * - Subsequent pages: Detailed HTML/PDF sections
 * - Supports: Technical reports, Business reports, Development plans
 */

export class DocumentGenerator {
  constructor() {
    this.documentType = null;
    this.tableOfContents = [];
    this.sections = [];
    this.metadata = {
      projectName: '',
      generatedAt: new Date(),
      version: '7.2.0-alpha',
      integrityScore: 0,
      totalSections: 0
    };
  }

  /**
   * G1_INCEPTION: Analyze project and determine document type
   */
  analyzeProject(projectName, userIdea, referenceUrls = []) {
    console.log('[DocumentGenerator] G1_INCEPTION: Analyzing project...');
    
    // Analyze keywords to determine document type
    const keywords = (projectName + ' ' + userIdea).toLowerCase();
    
    if (this.isTechnicalReport(keywords)) {
      this.documentType = 'technical';
      this.buildTechnicalToC(projectName, userIdea);
    } else if (this.isBusinessReport(keywords)) {
      this.documentType = 'business';
      this.buildBusinessToC(projectName, userIdea);
    } else if (this.isDevelopmentPlan(keywords)) {
      this.documentType = 'development';
      this.buildDevelopmentToC(projectName, userIdea);
    } else {
      // Default: Technical report
      this.documentType = 'technical';
      this.buildTechnicalToC(projectName, userIdea);
    }

    this.metadata.projectName = projectName;
    this.metadata.totalSections = this.tableOfContents.length;

    console.log(`[DocumentGenerator] Document type: ${this.documentType}`);
    console.log(`[DocumentGenerator] Table of Contents: ${this.tableOfContents.length} sections`);

    return {
      type: this.documentType,
      toc: this.tableOfContents,
      metadata: this.metadata
    };
  }

  /**
   * Determine if this is a technical report
   */
  isTechnicalReport(keywords) {
    const technicalKeywords = [
      'api', 'backend', 'frontend', 'database', 'server',
      'architecture', 'system', 'platform', 'framework',
      'microservice', 'cloud', 'devops', 'ci/cd'
    ];
    return technicalKeywords.some(kw => keywords.includes(kw));
  }

  /**
   * Determine if this is a business report
   */
  isBusinessReport(keywords) {
    const businessKeywords = [
      'business', 'strategy', 'market', 'revenue', 'profit',
      'customer', 'sales', 'marketing', 'growth', 'expansion',
      'investment', 'roi', 'kpi'
    ];
    return businessKeywords.some(kw => keywords.includes(kw));
  }

  /**
   * Determine if this is a development plan
   */
  isDevelopmentPlan(keywords) {
    const developmentKeywords = [
      'roadmap', 'plan', 'schedule', 'milestone', 'timeline',
      'phase', 'sprint', 'release', 'development', 'project plan'
    ];
    return developmentKeywords.some(kw => keywords.includes(kw));
  }

  /**
   * Build Table of Contents for Technical Report
   */
  buildTechnicalToC(projectName, userIdea) {
    this.tableOfContents = [
      {
        id: 'section-1',
        title: '1. 핵심 아이디어',
        subtitle: '사용자 요구사항 + 최종 목표 + 백엔드 동작 원리',
        agent: 'Master Orchestrator',
        priority: 'critical'
      },
      {
        id: 'section-2',
        title: '2. 프로젝트 진행 현황',
        subtitle: '선정된 모델 + 95% 무결성 검증 과정',
        agent: 'Master Orchestrator',
        priority: 'critical'
      },
      {
        id: 'section-3',
        title: '3. 기술 스택 및 아키텍처',
        subtitle: 'RAG 수행 내역 + 최신 기술 스택',
        agent: 'Code Agent',
        reviewers: ['Quality Agent'],
        priority: 'high'
      },
      {
        id: 'section-4',
        title: '4. 주요 기능 및 특징',
        subtitle: 'RAG 논리 근거 + 목차 도출 과정',
        agent: 'Code Agent',
        reviewers: ['Red Team Agent'],
        priority: 'high'
      },
      {
        id: 'section-5',
        title: '5. 예상 일정 및 마일스톤',
        subtitle: '오케스트레이터 사고 흐름 (순서도)',
        agent: 'DevOps Agent',
        reviewers: ['Quality Agent'],
        priority: 'medium'
      },
      {
        id: 'section-6',
        title: '6. 기술 스택 상세',
        subtitle: '선택 이유 + 대안 비교 + 최신성 검증',
        agent: 'Code Agent',
        reviewers: ['Quality Agent', 'Red Team Agent'],
        priority: 'high'
      },
      {
        id: 'section-7',
        title: '7. 결론',
        subtitle: '요구사항별 분류 및 준수율 스코어',
        agent: 'Master Orchestrator',
        priority: 'critical'
      }
    ];
  }

  /**
   * Build Table of Contents for Business Report
   */
  buildBusinessToC(projectName, userIdea) {
    this.tableOfContents = [
      {
        id: 'section-1',
        title: '1. 핵심 아이디어',
        subtitle: '비즈니스 목표 + 기대 효과',
        agent: 'Master Orchestrator',
        priority: 'critical'
      },
      {
        id: 'section-2',
        title: '2. 시장 분석',
        subtitle: '3C, SWOT, PEST 분석',
        agent: 'Business Analyst',
        reviewers: ['Quality Agent'],
        priority: 'high'
      },
      {
        id: 'section-3',
        title: '3. 전략 수립',
        subtitle: '주요 전략 + 실행 계획',
        agent: 'Strategy Agent',
        reviewers: ['Red Team Agent'],
        priority: 'high'
      },
      {
        id: 'section-4',
        title: '4. 예상 성과',
        subtitle: 'KPI + 목표치 + 측정 방법',
        agent: 'Business Analyst',
        reviewers: ['Quality Agent'],
        priority: 'medium'
      },
      {
        id: 'section-5',
        title: '5. 리스크 관리',
        subtitle: '위험 요인 + 대응 방안',
        agent: 'Risk Manager',
        reviewers: ['Red Team Agent'],
        priority: 'high'
      },
      {
        id: 'section-6',
        title: '6. 결론',
        subtitle: '실행 가능성 스코어 + 권장사항',
        agent: 'Master Orchestrator',
        priority: 'critical'
      }
    ];
  }

  /**
   * Build Table of Contents for Development Plan
   */
  buildDevelopmentToC(projectName, userIdea) {
    this.tableOfContents = [
      {
        id: 'section-1',
        title: '1. 프로젝트 개요',
        subtitle: '목표 + 범위 + 제약사항',
        agent: 'Master Orchestrator',
        priority: 'critical'
      },
      {
        id: 'section-2',
        title: '2. 요구사항 분석',
        subtitle: '기능 요구사항 + 비기능 요구사항',
        agent: 'Requirements Agent',
        reviewers: ['Quality Agent'],
        priority: 'high'
      },
      {
        id: 'section-3',
        title: '3. 개발 로드맵',
        subtitle: 'Phase별 마일스톤 + 일정',
        agent: 'DevOps Agent',
        reviewers: ['Quality Agent'],
        priority: 'high'
      },
      {
        id: 'section-4',
        title: '4. 리소스 계획',
        subtitle: '인력 + 예산 + 도구',
        agent: 'Resource Manager',
        reviewers: ['Quality Agent'],
        priority: 'medium'
      },
      {
        id: 'section-5',
        title: '5. 리스크 및 대응',
        subtitle: '예상 위험 + 완화 방안',
        agent: 'Risk Manager',
        reviewers: ['Red Team Agent'],
        priority: 'high'
      },
      {
        id: 'section-6',
        title: '6. 결론',
        subtitle: '실행 가능성 + 성공 기준',
        agent: 'Master Orchestrator',
        priority: 'critical'
      }
    ];
  }

  /**
   * Generate Plan-Craft v5.0 First Page (Summary Layout)
   */
  generateFirstPage() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.metadata.projectName} - Plan-Craft v5.0 Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; }
    .page-break { page-break-after: always; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body class="bg-gray-50">
  <!-- First Page: Plan-Craft v5.0 Summary -->
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white page-break">
    <div class="max-w-4xl mx-auto px-8 py-12 text-center">
      <!-- Logo & Title -->
      <div class="mb-8">
        <div class="inline-block bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 mb-6">
          <h1 class="text-5xl font-bold tracking-tight">
            <i class="fas fa-rocket mr-3"></i>
            Plan-Craft v5.0
          </h1>
        </div>
        <p class="text-xl text-blue-200 font-light">
          AI-Powered Professional Report Generator
        </p>
      </div>

      <!-- Project Title -->
      <div class="mb-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <h2 class="text-4xl font-bold mb-4">
          ${this.metadata.projectName}
        </h2>
        <div class="flex items-center justify-center gap-4 text-sm text-blue-200">
          <span><i class="fas fa-file-alt mr-2"></i>${this.getDocumentTypeLabel()}</span>
          <span class="text-white">•</span>
          <span><i class="fas fa-calendar-alt mr-2"></i>${formattedDate}</span>
          <span class="text-white">•</span>
          <span><i class="fas fa-list-ol mr-2"></i>${this.metadata.totalSections} 섹션</span>
        </div>
      </div>

      <!-- Key Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div class="text-3xl mb-3"><i class="fas fa-robot"></i></div>
          <h3 class="text-lg font-bold mb-2">Multi-Agent System</h3>
          <p class="text-sm text-blue-200">여러 전문 AI 협업</p>
        </div>
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div class="text-3xl mb-3"><i class="fas fa-shield-alt"></i></div>
          <h3 class="text-lg font-bold mb-2">95% Integrity</h3>
          <p class="text-sm text-blue-200">무결성 보증 시스템</p>
        </div>
        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div class="text-3xl mb-3"><i class="fas fa-search"></i></div>
          <h3 class="text-lg font-bold mb-2">RAG Integration</h3>
          <p class="text-sm text-blue-200">외부 지식 통합</p>
        </div>
      </div>

      <!-- Integrity Score Badge -->
      <div class="inline-block bg-gradient-to-r from-green-400 to-emerald-500 rounded-full px-8 py-4 mb-8">
        <div class="flex items-center gap-3">
          <i class="fas fa-check-circle text-2xl"></i>
          <div class="text-left">
            <div class="text-sm font-medium">무결성 스코어</div>
            <div class="text-2xl font-bold">${this.metadata.integrityScore}%</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-sm text-blue-200">
        <p>Generated by Plan-Craft v${this.metadata.version}</p>
        <p class="mt-2">
          <i class="fas fa-github mr-2"></i>
          <a href="https://github.com/sungli01/plan-craft" class="hover:text-white transition-colors">
            github.com/sungli01/plan-craft
          </a>
        </p>
      </div>
    </div>
  </div>
`;
  }

  /**
   * Get document type label in Korean
   */
  getDocumentTypeLabel() {
    const labels = {
      'technical': '기술 보고서',
      'business': '경영 보고서',
      'development': '개발 계획서'
    };
    return labels[this.documentType] || '보고서';
  }

  /**
   * Generate Table of Contents Page
   */
  generateToC() {
    return `
  <!-- Table of Contents Page -->
  <div class="min-h-screen bg-white p-12 page-break">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-800 mb-8 pb-4 border-b-4 border-purple-600">
        <i class="fas fa-list-ul mr-3 text-purple-600"></i>
        목차 (Table of Contents)
      </h2>

      <div class="space-y-4">
        ${this.tableOfContents.map((section, index) => `
          <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              ${index + 1}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                ${section.title}
              </h3>
              <p class="text-sm text-gray-600 mb-2">
                ${section.subtitle}
              </p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  <i class="fas fa-user-circle mr-1"></i>
                  ${section.agent}
                </span>
                ${section.reviewers ? `
                  <span>
                    <i class="fas fa-user-check mr-1"></i>
                    검증: ${section.reviewers.join(', ')}
                  </span>
                ` : ''}
                <span class="px-2 py-1 rounded ${this.getPriorityBadgeClass(section.priority)}">
                  ${this.getPriorityLabel(section.priority)}
                </span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
`;
  }

  /**
   * Get priority badge CSS class
   */
  getPriorityBadgeClass(priority) {
    const classes = {
      'critical': 'bg-red-100 text-red-700',
      'high': 'bg-orange-100 text-orange-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'low': 'bg-green-100 text-green-700'
    };
    return classes[priority] || classes['medium'];
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority) {
    const labels = {
      'critical': '필수',
      'high': '높음',
      'medium': '중간',
      'low': '낮음'
    };
    return labels[priority] || '중간';
  }

  /**
   * Add section content
   */
  addSection(sectionId, content, diagrams = [], images = []) {
    this.sections.push({
      id: sectionId,
      content,
      diagrams,
      images,
      generatedAt: new Date()
    });
  }

  /**
   * Generate section page
   */
  generateSectionPage(section, tocItem) {
    return `
  <!-- Section: ${tocItem.title} -->
  <div class="min-h-screen bg-white p-12 page-break">
    <div class="max-w-4xl mx-auto">
      <!-- Section Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">
          ${tocItem.title}
        </h2>
        <p class="text-gray-600 mb-4">${tocItem.subtitle}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>
            <i class="fas fa-user-circle mr-1"></i>
            담당: ${tocItem.agent}
          </span>
          ${tocItem.reviewers ? `
            <span>
              <i class="fas fa-user-check mr-1"></i>
              검증: ${tocItem.reviewers.join(', ')}
            </span>
          ` : ''}
        </div>
        <div class="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
      </div>

      <!-- Section Content -->
      <div class="prose prose-lg max-w-none">
        ${section.content}
      </div>

      <!-- Diagrams -->
      ${section.diagrams && section.diagrams.length > 0 ? `
        <div class="mt-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-project-diagram mr-2"></i>
            다이어그램
          </h3>
          ${section.diagrams.map(diagram => `
            <div class="bg-gray-50 rounded-lg p-6 mb-4">
              <pre class="mermaid">${diagram}</pre>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Images -->
      ${section.images && section.images.length > 0 ? `
        <div class="mt-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-images mr-2"></i>
            관련 이미지
          </h3>
          <div class="grid grid-cols-2 gap-4">
            ${section.images.map(img => `
              <div class="rounded-lg overflow-hidden shadow-lg">
                <img src="${img.url}" alt="${img.caption}" class="w-full h-auto">
                ${img.caption ? `
                  <div class="bg-gray-100 p-3 text-sm text-gray-700">
                    ${img.caption}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  </div>
`;
  }

  /**
   * Generate complete HTML document
   */
  generateCompleteDocument() {
    console.log('[DocumentGenerator] Generating complete document...');

    let html = this.generateFirstPage();
    html += this.generateToC();

    // Generate all section pages
    this.sections.forEach(section => {
      const tocItem = this.tableOfContents.find(t => t.id === section.id);
      if (tocItem) {
        html += this.generateSectionPage(section, tocItem);
      }
    });

    // Close HTML
    html += `
  <!-- Mermaid JS for Diagrams -->
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
</body>
</html>
`;

    console.log(`[DocumentGenerator] Document generated: ${this.sections.length} sections`);
    return html;
  }

  /**
   * Export document data for further processing
   */
  exportData() {
    return {
      metadata: this.metadata,
      documentType: this.documentType,
      tableOfContents: this.tableOfContents,
      sections: this.sections,
      generatedHtml: this.generateCompleteDocument()
    };
  }
}

// Make globally available
window.DocumentGenerator = DocumentGenerator;

console.log('[DocumentGenerator] Module loaded successfully');
