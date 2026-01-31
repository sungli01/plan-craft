// Plan-Craft Demo Mode - Shows REAL working animations
// This demonstrates all features without creating an actual project

/**
 * Start Demo Mode
 */
function startDemoMode() {
  console.log('[Demo Mode] Starting demonstration...');
  
  addLog('INFO', '🎬 데모 모드 시작!');
  addLog('INFO', '모든 기능이 실제로 작동하는 것을 보여드립니다.');
  
  // Start progress timer (29 minutes = 1740 seconds)
  if (window.progressTimer) {
    window.progressTimer.start(29);
    addLog('SUCCESS', '⏱️ 진행 타이머 시작 (10초마다 자동 업데이트)');
  }
  
  // Demo: Show each AI model working
  demoAIModels();
}

/**
 * Demo AI Models in sequence
 */
async function demoAIModels() {
  const models = [
    {
      name: 'claude-3.5-sonnet',
      agent: 'Master Orchestrator',
      task: '프로젝트 구조 설계 중',
      duration: 5000 // 5 seconds
    },
    {
      name: 'gpt-4-turbo',
      agent: 'Code Agent',
      task: 'API 엔드포인트 코드 생성 중',
      duration: 5000
    },
    {
      name: 'gpt-4o-mini',
      agent: 'Quality Agent',
      task: '코드 품질 검증 중',
      duration: 5000
    },
    {
      name: 'gemini-2.0-flash',
      agent: 'DevOps Agent',
      task: '빌드 설정 최적화 중',
      duration: 5000
    }
  ];
  
  for (const model of models) {
    addLog('INFO', `\n🤖 ${model.agent} (${model.name}) 시작`);
    addLog('INFO', `📋 작업: ${model.task}`);
    
    // Start model animation
    if (window.aiModelTracker) {
      window.aiModelTracker.startModel(model.name, model.agent, model.task);
    }
    
    // Wait for duration
    await sleep(model.duration);
    
    // Stop model animation
    if (window.aiModelTracker) {
      window.aiModelTracker.stopModel();
    }
    
    addLog('SUCCESS', `✅ ${model.agent} 완료`);
    
    // Small pause between models
    await sleep(1000);
  }
  
  addLog('SUCCESS', '\n🎉 데모 완료! 모든 기능이 정상 작동합니다.');
  addLog('INFO', '실제 프로젝트를 생성하려면 "프로젝트 생성 및 시작" 버튼을 클릭하세요.');
  
  // Stop timer after demo
  if (window.progressTimer) {
    window.progressTimer.stop();
  }
}

/**
 * Demo error modal
 */
function demoErrorModal() {
  if (typeof ErrorHandler !== 'undefined') {
    ErrorHandler.showError(
      '데모: 품질 게이트 미통과',
      '이것은 에러 모달 데모입니다. 실제 에러가 아닙니다.',
      '실패 항목:\n• 테스트 커버리지: 85% < 95% (필요)\n• 보안 이슈: 3개 > 0개 (허용)\n\n자동으로 재작업이 진행됩니다.'
    );
  }
}

/**
 * Add demo button to UI
 */
function addDemoButton() {
  // Wait for form to load
  setTimeout(() => {
    const form = document.getElementById('create-project-form');
    if (form) {
      const demoButton = document.createElement('button');
      demoButton.type = 'button';
      demoButton.className = 'w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm md:text-base mb-3';
      demoButton.innerHTML = '<i class="fas fa-play-circle mr-2"></i>데모 모드 실행 (기능 확인)';
      demoButton.onclick = startDemoMode;
      
      // Insert before submit button
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.parentNode.insertBefore(demoButton, submitButton);
        
        // Also add error demo button
        const errorButton = document.createElement('button');
        errorButton.type = 'button';
        errorButton.className = 'w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all text-xs md:text-sm mb-3';
        errorButton.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>에러 모달 데모';
        errorButton.onclick = demoErrorModal;
        
        submitButton.parentNode.insertBefore(errorButton, submitButton);
      }
    }
  }, 1000);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-add demo button when page loads
if (typeof window !== 'undefined') {
  window.startDemoMode = startDemoMode;
  window.demoErrorModal = demoErrorModal;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDemoButton);
  } else {
    addDemoButton();
  }
  
  console.log('[Demo Mode] Module loaded - Use startDemoMode() to test');
}
