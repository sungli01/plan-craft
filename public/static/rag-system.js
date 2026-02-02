/**
 * Plan-Craft v5.0 - RAG System Module
 * 
 * RAG (Retrieval-Augmented Generation) 시스템
 * - 웹 검색: 키워드 기반 레퍼런스 검색
 * - 이미지 검색: 관련 이미지 검색 및 분석
 * - 이미지 생성: 필요 시 커스텀 다이어그램/일러스트 생성
 * - 로그 추적: 모든 RAG 활동 기록
 */

class RAGSystem {
  constructor() {
    this.searchHistory = [];
    this.imageSearchHistory = [];
    this.references = new Map();
    this.maxHistorySize = 100;
  }

  /**
   * 웹 검색 수행
   * @param {string} query - 검색 키워드
   * @param {string} purpose - 검색 목적 (예: "기술 스택 선정", "경쟁사 분석")
   * @returns {Promise<Object>} 검색 결과 및 로그
   */
  async searchWeb(query, purpose = '') {
    const timestamp = new Date().toISOString();
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[RAG] 웹 검색 시작: "${query}" (목적: ${purpose})`);

    try {
      // 실제 구현 시: WebSearch API 호출
      // const results = await webSearchAPI(query);
      
      // 현재는 시뮬레이션
      const mockResults = this._mockWebSearch(query);

      const searchLog = {
        id: searchId,
        type: 'web_search',
        query,
        purpose,
        timestamp,
        resultsCount: mockResults.length,
        results: mockResults,
        status: 'success'
      };

      this.searchHistory.push(searchLog);
      this._trimHistory();

      // 레퍼런스 저장
      mockResults.forEach(result => {
        this.references.set(result.url, {
          title: result.title,
          snippet: result.snippet,
          source: 'web_search',
          searchId,
          timestamp
        });
      });

      console.log(`[RAG] ✅ 웹 검색 완료: ${mockResults.length}개 결과`);

      return {
        searchId,
        query,
        purpose,
        results: mockResults,
        timestamp,
        logEntry: searchLog
      };

    } catch (error) {
      console.error(`[RAG] ❌ 웹 검색 실패:`, error);
      
      const errorLog = {
        id: searchId,
        type: 'web_search',
        query,
        purpose,
        timestamp,
        status: 'error',
        error: error.message
      };

      this.searchHistory.push(errorLog);
      return { searchId, query, error: error.message };
    }
  }

  /**
   * 이미지 검색 수행
   * @param {string} query - 이미지 검색 키워드
   * @param {string} purpose - 검색 목적
   * @returns {Promise<Object>} 이미지 검색 결과
   */
  async searchImages(query, purpose = '') {
    const timestamp = new Date().toISOString();
    const searchId = `img_search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[RAG] 이미지 검색 시작: "${query}" (목적: ${purpose})`);

    try {
      // 실제 구현 시: image_search API 호출
      // const images = await imageSearchAPI(query);

      // 현재는 시뮬레이션
      const mockImages = this._mockImageSearch(query);

      const searchLog = {
        id: searchId,
        type: 'image_search',
        query,
        purpose,
        timestamp,
        resultsCount: mockImages.length,
        images: mockImages,
        status: 'success'
      };

      this.imageSearchHistory.push(searchLog);
      this._trimHistory();

      console.log(`[RAG] ✅ 이미지 검색 완료: ${mockImages.length}개 결과`);

      return {
        searchId,
        query,
        purpose,
        images: mockImages,
        timestamp,
        logEntry: searchLog
      };

    } catch (error) {
      console.error(`[RAG] ❌ 이미지 검색 실패:`, error);
      
      const errorLog = {
        id: searchId,
        type: 'image_search',
        query,
        purpose,
        timestamp,
        status: 'error',
        error: error.message
      };

      this.imageSearchHistory.push(errorLog);
      return { searchId, query, error: error.message };
    }
  }

  /**
   * 이미지 분석 및 참고
   * @param {string} imageUrl - 분석할 이미지 URL
   * @param {string} instruction - 분석 지시사항
   * @returns {Promise<Object>} 이미지 분석 결과
   */
  async analyzeImage(imageUrl, instruction) {
    const timestamp = new Date().toISOString();
    const analysisId = `img_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[RAG] 이미지 분석 시작: ${imageUrl}`);
    console.log(`[RAG] 분석 지시: ${instruction}`);

    try {
      // 실제 구현 시: understand_images API 호출
      // const analysis = await understandImagesAPI(imageUrl, instruction);

      // 현재는 시뮬레이션
      const mockAnalysis = {
        imageUrl,
        instruction,
        findings: [
          "이미지에서 시스템 아키텍처 다이어그램 확인됨",
          "주요 구성요소: Frontend, Backend, Database, AI Service",
          "데이터 흐름: 사용자 → Frontend → API Gateway → Backend → Database",
          "추천: 마이크로서비스 아키텍처 패턴 적용 가능"
        ],
        keyElements: [
          { element: "Frontend", technology: "React", reason: "사용자 인터페이스" },
          { element: "Backend", technology: "Node.js", reason: "API 서버" },
          { element: "Database", technology: "PostgreSQL", reason: "데이터 저장" }
        ],
        confidence: 0.92
      };

      const analysisLog = {
        id: analysisId,
        type: 'image_analysis',
        imageUrl,
        instruction,
        timestamp,
        analysis: mockAnalysis,
        status: 'success'
      };

      this.imageSearchHistory.push(analysisLog);

      console.log(`[RAG] ✅ 이미지 분석 완료 (신뢰도: ${mockAnalysis.confidence * 100}%)`);

      return {
        analysisId,
        imageUrl,
        analysis: mockAnalysis,
        timestamp,
        logEntry: analysisLog
      };

    } catch (error) {
      console.error(`[RAG] ❌ 이미지 분석 실패:`, error);
      return { analysisId, imageUrl, error: error.message };
    }
  }

  /**
   * 이미지 생성 (다이어그램, 일러스트 등)
   * @param {string} prompt - 생성할 이미지 설명
   * @param {string} type - 이미지 타입 (diagram, illustration, chart)
   * @returns {Promise<Object>} 생성된 이미지 정보
   */
  async generateImage(prompt, type = 'diagram') {
    const timestamp = new Date().toISOString();
    const generationId = `img_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[RAG] 이미지 생성 시작 (타입: ${type})`);
    console.log(`[RAG] 프롬프트: ${prompt}`);

    try {
      // 실제 구현 시: image_generation API 호출
      // const image = await imageGenerationAPI(prompt, type);

      // 현재는 시뮬레이션
      const mockImage = {
        imageUrl: `https://generated-images.plan-craft.ai/${generationId}.png`,
        prompt,
        type,
        model: type === 'diagram' ? 'fal-ai/flux-2-pro' : 'nano-banana-pro',
        aspectRatio: '16:9',
        size: '1920x1080',
        generatedAt: timestamp
      };

      const generationLog = {
        id: generationId,
        type: 'image_generation',
        prompt,
        imageType: type,
        timestamp,
        result: mockImage,
        status: 'success'
      };

      this.imageSearchHistory.push(generationLog);

      console.log(`[RAG] ✅ 이미지 생성 완료: ${mockImage.imageUrl}`);

      return {
        generationId,
        image: mockImage,
        timestamp,
        logEntry: generationLog
      };

    } catch (error) {
      console.error(`[RAG] ❌ 이미지 생성 실패:`, error);
      return { generationId, error: error.message };
    }
  }

  /**
   * RAG 워크플로우: 전체 프로세스 실행
   * @param {Object} request - RAG 요청 정보
   * @returns {Promise<Object>} 워크플로우 결과
   */
  async executeWorkflow(request) {
    const {
      projectName,
      userIdea,
      reportType = 'technical', // technical, business, marketing
      needImages = true
    } = request;

    console.log(`\n[RAG Workflow] 시작: ${projectName}`);
    console.log(`[RAG Workflow] 보고서 유형: ${reportType}`);
    console.log(`[RAG Workflow] 이미지 필요: ${needImages}\n`);

    const workflow = {
      projectName,
      userIdea,
      reportType,
      startTime: new Date().toISOString(),
      steps: [],
      references: [],
      images: []
    };

    try {
      // Step 1: 키워드 추출
      const keywords = this._extractKeywords(userIdea);
      workflow.steps.push({
        step: 1,
        name: '키워드 추출',
        keywords,
        timestamp: new Date().toISOString()
      });

      // Step 2: 웹 검색 (각 키워드)
      for (const keyword of keywords.slice(0, 3)) { // 최대 3개
        const searchResult = await this.searchWeb(
          keyword,
          `${projectName} - ${reportType} 보고서 작성을 위한 레퍼런스 검색`
        );
        workflow.references.push(...searchResult.results);
      }

      workflow.steps.push({
        step: 2,
        name: '웹 검색',
        resultsCount: workflow.references.length,
        timestamp: new Date().toISOString()
      });

      // Step 3: 이미지 검색 및 분석 (필요 시)
      if (needImages) {
        const imageKeyword = keywords[0]; // 주요 키워드
        const imageSearchResult = await this.searchImages(
          imageKeyword,
          `${projectName} - 시각 자료 수집`
        );

        if (imageSearchResult.images && imageSearchResult.images.length > 0) {
          // 첫 번째 이미지 분석
          const topImage = imageSearchResult.images[0];
          const analysisResult = await this.analyzeImage(
            topImage.url,
            `이 이미지에서 ${projectName} 프로젝트에 활용 가능한 아키텍처, 디자인 패턴, 기술 스택 정보를 추출하세요.`
          );

          workflow.images.push({
            url: topImage.url,
            analysis: analysisResult.analysis
          });
        }

        workflow.steps.push({
          step: 3,
          name: '이미지 검색 및 분석',
          imagesCount: workflow.images.length,
          timestamp: new Date().toISOString()
        });

        // Step 4: 커스텀 이미지 생성 (필요 시)
        if (reportType === 'technical') {
          const diagramPrompt = `${projectName} 시스템 아키텍처 다이어그램: ${userIdea}의 주요 구성요소와 데이터 흐름을 보여주는 기술 다이어그램`;
          const generatedImage = await this.generateImage(diagramPrompt, 'diagram');
          
          workflow.images.push({
            url: generatedImage.image.imageUrl,
            type: 'generated',
            purpose: 'system_architecture'
          });

          workflow.steps.push({
            step: 4,
            name: '커스텀 이미지 생성',
            imageUrl: generatedImage.image.imageUrl,
            timestamp: new Date().toISOString()
          });
        }
      }

      workflow.endTime = new Date().toISOString();
      workflow.status = 'success';
      workflow.summary = {
        totalReferences: workflow.references.length,
        totalImages: workflow.images.length,
        totalSteps: workflow.steps.length
      };

      console.log(`\n[RAG Workflow] ✅ 완료`);
      console.log(`[RAG Workflow] 레퍼런스: ${workflow.references.length}개`);
      console.log(`[RAG Workflow] 이미지: ${workflow.images.length}개`);
      console.log(`[RAG Workflow] 총 단계: ${workflow.steps.length}개\n`);

      return workflow;

    } catch (error) {
      console.error(`[RAG Workflow] ❌ 실패:`, error);
      workflow.endTime = new Date().toISOString();
      workflow.status = 'error';
      workflow.error = error.message;
      return workflow;
    }
  }

  /**
   * RAG 로그 조회
   * @param {string} type - 로그 타입 (web_search, image_search, image_analysis, image_generation)
   * @param {number} limit - 조회 개수
   * @returns {Array} 로그 목록
   */
  getLogs(type = null, limit = 10) {
    const allLogs = [...this.searchHistory, ...this.imageSearchHistory]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (type) {
      return allLogs.filter(log => log.type === type).slice(0, limit);
    }

    return allLogs.slice(0, limit);
  }

  /**
   * 레퍼런스 조회
   * @returns {Array} 저장된 레퍼런스 목록
   */
  getReferences() {
    return Array.from(this.references.entries()).map(([url, data]) => ({
      url,
      ...data
    }));
  }

  /**
   * 히스토리 초기화
   */
  clearHistory() {
    this.searchHistory = [];
    this.imageSearchHistory = [];
    this.references.clear();
    console.log('[RAG] 히스토리 초기화 완료');
  }

  // ============================================================
  // Private Methods (시뮬레이션 및 유틸리티)
  // ============================================================

  _mockWebSearch(query) {
    // 실제 구현 시 삭제 예정
    return [
      {
        title: `${query} - 공식 문서`,
        url: `https://docs.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `${query}에 대한 공식 문서입니다. 주요 개념, 아키텍처, 모범 사례 등을 포함합니다.`,
        relevance: 0.95
      },
      {
        title: `${query} Best Practices 2026`,
        url: `https://blog.example.com/${query}-best-practices`,
        snippet: `2026년 최신 ${query} 베스트 프랙티스를 소개합니다. 성능 최적화, 보안, 확장성 등을 다룹니다.`,
        relevance: 0.88
      },
      {
        title: `${query} vs Alternatives Comparison`,
        url: `https://comparison.example.com/${query}`,
        snippet: `${query}와 다른 대안들을 비교 분석합니다. 장단점, 사용 사례, 비용 등을 상세히 설명합니다.`,
        relevance: 0.82
      }
    ];
  }

  _mockImageSearch(query) {
    // 실제 구현 시 삭제 예정
    return [
      {
        url: `https://images.example.com/${query}-diagram-1.png`,
        title: `${query} Architecture Diagram`,
        description: `${query} 시스템 아키텍처 다이어그램`,
        width: 1920,
        height: 1080,
        source: 'example.com'
      },
      {
        url: `https://images.example.com/${query}-flowchart-2.png`,
        title: `${query} Process Flowchart`,
        description: `${query} 프로세스 플로우차트`,
        width: 1600,
        height: 900,
        source: 'example.com'
      }
    ];
  }

  _extractKeywords(text) {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 필요)
    const stopWords = new Set(['을', '를', '이', '가', '은', '는', '의', '에', 'and', 'or', 'the', 'a', 'an']);
    const words = text.toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // 빈도수 계산 후 상위 5개 반환
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  _trimHistory() {
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(-this.maxHistorySize);
    }
    if (this.imageSearchHistory.length > this.maxHistorySize) {
      this.imageSearchHistory = this.imageSearchHistory.slice(-this.maxHistorySize);
    }
  }
}

// Singleton 인스턴스
const ragSystem = new RAGSystem();

// 브라우저 환경에서 전역 노출
if (typeof window !== 'undefined') {
  window.ragSystem = ragSystem;
}

// Export
export default ragSystem;

console.log('[RAG System] ✅ 모듈 로드 완료');
