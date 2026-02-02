/**
 * Plan-Craft v5.0 Diagram Generator
 * 
 * Purpose: Automatically generate Mermaid diagrams for documentation
 * - Flowcharts: Workflow and process visualization
 * - Sequence diagrams: Agent interaction flows
 * - Gantt charts: Project timelines and milestones
 * - Architecture diagrams: System architecture visualization
 */

export class DiagramGenerator {
  constructor() {
    this.diagrams = [];
    this.diagramTypes = {
      FLOWCHART: 'flowchart',
      SEQUENCE: 'sequence',
      GANTT: 'gantt',
      ARCHITECTURE: 'architecture',
      STATE: 'state',
      ENTITY_RELATIONSHIP: 'er'
    };
  }

  /**
   * Generate Orchestrator Thinking Flow (순서도)
   * Used in Section 5: Expected Schedule & Milestones
   */
  generateOrchestratorFlow(phases) {
    console.log('[DiagramGenerator] Generating orchestrator thinking flow...');

    const flowchart = `
flowchart TD
    Start([🚀 프로젝트 시작]) --> G1[G1: INCEPTION<br/>의도 파악 및 전략 수립]
    
    G1 --> G1_1{보고서<br/>유형 분석}
    G1_1 -->|기술 보고서| G1_Tech[기술 목차 구성]
    G1_1 -->|경영 보고서| G1_Biz[경영 목차 구성]
    G1_1 -->|개발 계획서| G1_Dev[개발 목차 구성]
    
    G1_Tech --> G1_2[에이전트 역할 할당]
    G1_Biz --> G1_2
    G1_Dev --> G1_2
    
    G1_2 --> G2[G2: RESEARCH<br/>RAG 기반 사고]
    
    G2 --> G2_1[웹 검색 수행]
    G2_1 --> G2_2[이미지 검색 및 분석]
    G2_2 --> G2_3[레퍼런스 수집]
    G2_3 --> G2_4{충분한<br/>자료?}
    
    G2_4 -->|부족| G2_1
    G2_4 -->|충분| G3[G3: DEVELOPMENT<br/>초안 작성]
    
    G3 --> G3_1[Code Agent 작성]
    G3 --> G3_2[Business Agent 작성]
    G3 --> G3_3[DevOps Agent 작성]
    
    G3_1 --> G4[G4: TESTING<br/>피드백 루프]
    G3_2 --> G4
    G3_3 --> G4
    
    G4 --> G4_1[Quality Agent 검증]
    G4_1 --> G4_2[Red Team Agent 검증]
    G4_2 --> G4_3{무결성<br/>95% 이상?}
    
    G4_3 -->|미달| G4_4[피드백 반영]
    G4_4 --> G3
    G4_3 -->|통과| G5[G5: DEPLOYMENT<br/>최종 문서화]
    
    G5 --> G5_1[HTML 생성]
    G5_1 --> G5_2[Mermaid 다이어그램 삽입]
    G5_2 --> G5_3[이미지 생성 및 삽입]
    G5_3 --> G5_4[PDF 변환]
    G5_4 --> End([✅ 완료])
    
    style Start fill:#a78bfa
    style End fill:#10b981
    style G1 fill:#8b5cf6
    style G2 fill:#3b82f6
    style G3 fill:#06b6d4
    style G4 fill:#f59e0b
    style G5 fill:#10b981
    style G4_3 fill:#ef4444
`;

    this.diagrams.push({
      type: this.diagramTypes.FLOWCHART,
      title: '오케스트레이터 사고 흐름',
      content: flowchart,
      section: 'section-5'
    });

    return flowchart;
  }

  /**
   * Generate Multi-Agent Feedback Loop Sequence Diagram
   * Used in Section 4: Key Features
   */
  generateFeedbackLoopSequence() {
    console.log('[DiagramGenerator] Generating feedback loop sequence...');

    const sequence = `
sequenceDiagram
    participant MO as Master Orchestrator
    participant CA as Code Agent
    participant QA as Quality Agent
    participant RT as Red Team Agent
    participant IE as Integrity Engine
    
    MO->>CA: 초안 작성 요청 (Section 3)
    CA->>CA: RAG 검색 및 초안 작성
    CA->>QA: 초안 제출
    
    QA->>QA: 논리 검증 (긍정 피드백)
    QA->>CA: ✅ 개선사항 제안
    
    CA->>CA: 피드백 반영 (v2)
    CA->>RT: 수정본 제출
    
    RT->>RT: 레드팀 검증 (부정 피드백)
    RT->>CA: ⚠️ 취약점 지적
    
    CA->>CA: 재수정 (v3)
    CA->>IE: 최종 검증 요청
    
    IE->>IE: 무결성 스코어 계산
    IE-->>MO: Score: 94% (미달)
    
    MO->>CA: 추가 수정 지시
    CA->>CA: 최종 보완 (v4)
    CA->>IE: 재검증 요청
    
    IE->>IE: 무결성 스코어 재계산
    IE-->>MO: Score: 96% ✅ (통과)
    
    MO->>MO: 최종 승인
`;

    this.diagrams.push({
      type: this.diagramTypes.SEQUENCE,
      title: '멀티 에이전트 피드백 루프',
      content: sequence,
      section: 'section-4'
    });

    return sequence;
  }

  /**
   * Generate Gantt Chart for Project Timeline
   * Used in Section 5: Expected Schedule & Milestones
   */
  generateGanttChart(projectName, startDate, phases) {
    console.log('[DiagramGenerator] Generating Gantt chart...');

    const gantt = `
gantt
    title ${projectName} 프로젝트 일정
    dateFormat YYYY-MM-DD
    section Phase 1: 백엔드 강화
        RAG 시스템 통합           :done, p1-1, 2026-02-01, 2d
        피드백 루프 개발          :done, p1-2, 2026-02-02, 2d
        무결성 엔진 구현          :done, p1-3, 2026-02-03, 2d
    section Phase 2: 문서 생성
        HTML 템플릿 개발          :active, p2-1, 2026-02-04, 3d
        Mermaid 다이어그램        :active, p2-2, 2026-02-05, 2d
        이미지 생성 통합          :p2-3, 2026-02-06, 2d
        PDF 변환 시스템           :p2-4, 2026-02-07, 2d
    section Phase 3: AI 통합
        OpenAI API 연동           :p3-1, 2026-02-10, 3d
        Claude API 연동           :p3-2, 2026-02-11, 2d
        Gemini API 연동           :p3-3, 2026-02-12, 2d
        모델 선택 로직            :p3-4, 2026-02-13, 2d
    section Phase 4: UI 개선
        실시간 진행 표시          :p4-1, 2026-02-17, 2d
        RAG 로그 표시             :p4-2, 2026-02-18, 2d
        스코어 대시보드           :p4-3, 2026-02-19, 2d
`;

    this.diagrams.push({
      type: this.diagramTypes.GANTT,
      title: '프로젝트 타임라인',
      content: gantt,
      section: 'section-5'
    });

    return gantt;
  }

  /**
   * Generate System Architecture Diagram
   * Used in Section 3: Technical Stack & Architecture
   */
  generateArchitectureDiagram() {
    console.log('[DiagramGenerator] Generating architecture diagram...');

    const architecture = `
flowchart LR
    subgraph Frontend["🎨 Frontend Layer"]
        UI[UI Components<br/>TailwindCSS]
        Forms[Project Forms]
        Display[Progress Display]
    end
    
    subgraph Core["⚙️ Core Engine"]
        Orchestrator[Master Orchestrator]
        UnifiedCore[Unified Core]
        ThinkingProcess[Thinking Process]
    end
    
    subgraph Agents["🤖 AI Agents"]
        CodeAgent[Code Agent]
        QualityAgent[Quality Agent]
        RedTeam[Red Team Agent]
        DevOpsAgent[DevOps Agent]
    end
    
    subgraph Backend["🔧 Backend Systems"]
        RAG[RAG System]
        Feedback[Feedback Loop]
        Integrity[Integrity Engine]
    end
    
    subgraph Output["📄 Output Layer"]
        DocGen[Document Generator]
        DiagramGen[Diagram Generator]
        PDFConverter[PDF Converter]
    end
    
    subgraph External["🌐 External APIs"]
        WebSearch[Web Search API]
        ImageSearch[Image Search API]
        ImageGen[Image Generation API]
        LLMAPIs[LLM APIs<br/>OpenAI/Claude/Gemini]
    end
    
    UI --> Orchestrator
    Forms --> UnifiedCore
    Display --> ThinkingProcess
    
    Orchestrator --> CodeAgent
    Orchestrator --> QualityAgent
    Orchestrator --> RedTeam
    Orchestrator --> DevOpsAgent
    
    CodeAgent --> RAG
    QualityAgent --> Feedback
    RedTeam --> Feedback
    Feedback --> Integrity
    
    RAG --> WebSearch
    RAG --> ImageSearch
    RAG --> ImageGen
    
    Orchestrator --> DocGen
    DocGen --> DiagramGen
    DocGen --> PDFConverter
    
    CodeAgent --> LLMAPIs
    QualityAgent --> LLMAPIs
    RedTeam --> LLMAPIs
    
    style Frontend fill:#ddd6fe
    style Core fill:#c7d2fe
    style Agents fill:#bfdbfe
    style Backend fill:#a5f3fc
    style Output fill:#a7f3d0
    style External fill:#fecaca
`;

    this.diagrams.push({
      type: this.diagramTypes.ARCHITECTURE,
      title: '시스템 아키텍처',
      content: architecture,
      section: 'section-3'
    });

    return architecture;
  }

  /**
   * Generate State Diagram for Agent Lifecycle
   * Used in Section 4: Key Features
   */
  generateAgentStateDiagram() {
    console.log('[DiagramGenerator] Generating agent state diagram...');

    const state = `
stateDiagram-v2
    [*] --> Idle: 에이전트 생성
    
    Idle --> Analyzing: 작업 할당
    Analyzing --> Researching: RAG 수행
    Researching --> Writing: 초안 작성
    
    Writing --> UnderReview: 검증 요청
    UnderReview --> Revising: 피드백 수신
    Revising --> Writing: 재작성
    
    UnderReview --> Validating: 무결성 검증
    Validating --> Revising: 스코어 미달 (<95%)
    Validating --> Completed: 스코어 통과 (≥95%)
    
    Completed --> [*]: 작업 완료
    
    note right of Analyzing
        Master Orchestrator가
        섹션 할당
    end note
    
    note right of Researching
        웹 검색 + 이미지 검색
        레퍼런스 수집
    end note
    
    note right of UnderReview
        Quality Agent +
        Red Team Agent 검증
    end note
    
    note right of Validating
        Integrity Engine
        스코어 계산
    end note
`;

    this.diagrams.push({
      type: this.diagramTypes.STATE,
      title: 'AI 에이전트 생명주기',
      content: state,
      section: 'section-4'
    });

    return state;
  }

  /**
   * Generate Entity-Relationship Diagram
   * Used in Section 3: Technical Stack (if database is involved)
   */
  generateERDiagram(entities) {
    console.log('[DiagramGenerator] Generating ER diagram...');

    const er = `
erDiagram
    PROJECT ||--o{ SECTION : contains
    PROJECT ||--|| METADATA : has
    PROJECT ||--o{ AGENT : uses
    
    SECTION ||--o{ CONTENT : includes
    SECTION ||--o{ DIAGRAM : has
    SECTION ||--o{ IMAGE : has
    
    AGENT ||--o{ FEEDBACK : provides
    FEEDBACK ||--|| INTEGRITY_SCORE : calculates
    
    PROJECT {
        string id PK
        string name
        string type
        datetime created_at
        float integrity_score
    }
    
    SECTION {
        string id PK
        string project_id FK
        string title
        string subtitle
        string agent
        int order
    }
    
    CONTENT {
        string id PK
        string section_id FK
        text content
        string format
    }
    
    AGENT {
        string id PK
        string name
        string role
        string model
        string status
    }
    
    FEEDBACK {
        string id PK
        string agent_id FK
        string section_id FK
        string type
        text message
        int round
    }
    
    INTEGRITY_SCORE {
        string id PK
        string feedback_id FK
        float accuracy
        float completeness
        float consistency
        float total
    }
    
    DIAGRAM {
        string id PK
        string section_id FK
        string type
        text content
    }
    
    IMAGE {
        string id PK
        string section_id FK
        string url
        string caption
        string source
    }
`;

    this.diagrams.push({
      type: this.diagramTypes.ENTITY_RELATIONSHIP,
      title: '데이터 모델 구조',
      content: er,
      section: 'section-3'
    });

    return er;
  }

  /**
   * Get diagrams by section ID
   */
  getDiagramsBySection(sectionId) {
    return this.diagrams.filter(d => d.section === sectionId);
  }

  /**
   * Get all diagrams
   */
  getAllDiagrams() {
    return this.diagrams;
  }

  /**
   * Generate all default diagrams for a technical report
   */
  generateAllDefaultDiagrams(projectName) {
    console.log('[DiagramGenerator] Generating all default diagrams...');

    this.generateArchitectureDiagram();
    this.generateFeedbackLoopSequence();
    this.generateAgentStateDiagram();
    this.generateOrchestratorFlow();
    this.generateGanttChart(projectName, new Date(), []);

    console.log(`[DiagramGenerator] Generated ${this.diagrams.length} diagrams`);
    return this.diagrams;
  }

  /**
   * Export diagrams data
   */
  exportData() {
    return {
      total: this.diagrams.length,
      diagrams: this.diagrams,
      types: Object.keys(this.diagramTypes)
    };
  }

  /**
   * Clear all diagrams
   */
  clear() {
    this.diagrams = [];
  }
}

// Make globally available
window.DiagramGenerator = DiagramGenerator;

console.log('[DiagramGenerator] Module loaded successfully');
