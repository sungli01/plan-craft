// Plan-Craft v5.0 - API Key Manager Module
// ============================================
// Secure API key management with localStorage persistence

/**
 * API Key Manager
 * Manages API keys for various AI providers
 */
class APIKeyManager {
  constructor() {
    this.keys = this.loadKeys();
    this.providers = {
      'openai': {
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        required: false
      },
      'anthropic': {
        name: 'Anthropic',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet'],
        required: false
      },
      'google': {
        name: 'Google AI',
        models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        required: false
      }
    };
  }

  /**
   * Load API keys from localStorage
   */
  loadKeys() {
    try {
      const stored = localStorage.getItem('plan-craft-api-keys');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[APIKeyManager] Failed to load keys:', error);
      return {};
    }
  }

  /**
   * Save API keys to localStorage
   */
  saveKeys() {
    try {
      localStorage.setItem('plan-craft-api-keys', JSON.stringify(this.keys));
      console.log('[APIKeyManager] Keys saved successfully');
      return true;
    } catch (error) {
      console.error('[APIKeyManager] Failed to save keys:', error);
      return false;
    }
  }

  /**
   * Set API key for a provider
   */
  setKey(provider, key) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    this.keys[provider] = {
      key: key,
      updatedAt: Date.now()
    };

    this.saveKeys();
    console.log(`[APIKeyManager] Key set for ${provider}`);
  }

  /**
   * Get API key for a provider
   */
  getKey(provider) {
    return this.keys[provider]?.key || null;
  }

  /**
   * Check if API key exists for a provider
   */
  hasKey(provider) {
    return !!this.getKey(provider);
  }

  /**
   * Remove API key for a provider
   */
  removeKey(provider) {
    if (this.keys[provider]) {
      delete this.keys[provider];
      this.saveKeys();
      console.log(`[APIKeyManager] Key removed for ${provider}`);
    }
  }

  /**
   * Get all configured providers
   */
  getConfiguredProviders() {
    return Object.keys(this.keys);
  }

  /**
   * Show API key setup modal
   */
  showSetupModal(provider = null, callback = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.id = 'api-key-modal';

    const providers = provider ? [provider] : Object.keys(this.providers);

    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-key text-purple-600"></i>
              API 키 설정
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              AI 모델 사용을 위한 API 키를 입력하세요 (안전하게 로컬 저장됩니다)
            </p>
          </div>
          <button
            onclick="document.getElementById('api-key-modal').remove()"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-6">
          ${providers.map(p => {
            const info = this.providers[p];
            const hasKey = this.hasKey(p);
            
            return `
              <div class="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br ${this.getProviderColor(p)} rounded-lg flex items-center justify-center">
                      <i class="fas ${this.getProviderIcon(p)} text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-800">${info.name}</h3>
                      <p class="text-xs text-gray-600">
                        ${info.models.length} models available
                      </p>
                    </div>
                  </div>
                  ${hasKey ? `
                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <i class="fas fa-check-circle"></i>
                      설정됨
                    </span>
                  ` : `
                    <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                      미설정
                    </span>
                  `}
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">
                    API Key
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="password"
                      id="api-key-${p}"
                      placeholder="${hasKey ? '••••••••••••••••' : 'sk-...'}"
                      class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm font-mono"
                    />
                    <button
                      onclick="window.apiKeyManager.toggleVisibility('api-key-${p}')"
                      class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      title="표시/숨기기"
                    >
                      <i class="fas fa-eye text-gray-600"></i>
                    </button>
                  </div>
                  
                  <div class="flex gap-2 mt-2">
                    <button
                      onclick="window.apiKeyManager.saveKeyFromModal('${p}')"
                      class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                    >
                      <i class="fas fa-save mr-1"></i>
                      저장
                    </button>
                    ${hasKey ? `
                      <button
                        onclick="window.apiKeyManager.removeKeyFromModal('${p}')"
                        class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-all"
                      >
                        <i class="fas fa-trash mr-1"></i>
                        삭제
                      </button>
                    ` : ''}
                  </div>
                </div>

                <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p class="text-xs text-blue-800 font-semibold mb-1">
                    <i class="fas fa-info-circle mr-1"></i>
                    지원 모델
                  </p>
                  <div class="flex flex-wrap gap-1">
                    ${info.models.map(m => `
                      <span class="bg-white text-blue-700 px-2 py-1 rounded text-xs font-mono">
                        ${m}
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mt-6 pt-6 border-t-2 border-gray-200">
          <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800 flex items-start gap-2">
              <i class="fas fa-shield-alt mt-0.5"></i>
              <span>
                <strong>보안:</strong> API 키는 브라우저의 localStorage에만 저장되며 서버로 전송되지 않습니다.
                개인 정보 보호를 위해 공용 컴퓨터에서 사용 후 반드시 삭제하세요.
              </span>
            </p>
          </div>
          
          <button
            onclick="document.getElementById('api-key-modal').remove(); ${callback ? `(${callback})()` : ''}"
            class="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Toggle password visibility
   */
  toggleVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  /**
   * Save key from modal
   */
  saveKeyFromModal(provider) {
    const input = document.getElementById(`api-key-${provider}`);
    if (!input) return;

    const key = input.value.trim();
    if (!key) {
      alert('API 키를 입력해주세요.');
      return;
    }

    try {
      this.setKey(provider, key);
      alert(`${this.providers[provider].name} API 키가 저장되었습니다!`);
      
      // Update UI
      const modal = document.getElementById('api-key-modal');
      if (modal) {
        modal.remove();
        this.showSetupModal();
      }
    } catch (error) {
      alert(`오류: ${error.message}`);
    }
  }

  /**
   * Remove key from modal
   */
  removeKeyFromModal(provider) {
    if (!confirm(`${this.providers[provider].name} API 키를 삭제하시겠습니까?`)) {
      return;
    }

    this.removeKey(provider);
    alert(`${this.providers[provider].name} API 키가 삭제되었습니다.`);
    
    // Update UI
    const modal = document.getElementById('api-key-modal');
    if (modal) {
      modal.remove();
      this.showSetupModal();
    }
  }

  /**
   * Get provider color
   */
  getProviderColor(provider) {
    const colors = {
      'openai': 'from-green-500 to-green-600',
      'anthropic': 'from-orange-500 to-orange-600',
      'google': 'from-blue-500 to-blue-600'
    };
    return colors[provider] || 'from-gray-500 to-gray-600';
  }

  /**
   * Get provider icon
   */
  getProviderIcon(provider) {
    const icons = {
      'openai': 'fa-robot',
      'anthropic': 'fa-brain',
      'google': 'fa-google'
    };
    return icons[provider] || 'fa-key';
  }

  /**
   * Check if ready to use a model
   */
  isModelReady(modelName) {
    for (const [provider, info] of Object.entries(this.providers)) {
      if (info.models.includes(modelName)) {
        return this.hasKey(provider);
      }
    }
    return false;
  }

  /**
   * Get status summary
   */
  getStatusSummary() {
    const total = Object.keys(this.providers).length;
    const configured = this.getConfiguredProviders().length;
    
    return {
      total,
      configured,
      percentage: Math.round((configured / total) * 100),
      providers: Object.keys(this.providers).map(p => ({
        name: this.providers[p].name,
        configured: this.hasKey(p),
        models: this.providers[p].models.length
      }))
    };
  }
}

// Create singleton instance
const apiKeyManager = new APIKeyManager();

// Expose to window
if (typeof window !== 'undefined') {
  window.apiKeyManager = apiKeyManager;
}

export default apiKeyManager;

console.log('[API Key Manager Module] ✅ Loaded successfully');
console.log('[API Key Manager] Status:', apiKeyManager.getStatusSummary());
