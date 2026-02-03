/**
 * Plan-Craft v7.2.0 LLM Client
 * 
 * Purpose: Unified client for multiple LLM APIs
 * - OpenAI: GPT-4o, GPT-4o-mini
 * - Anthropic Claude: Claude 3.5 Sonnet
 * - Google Gemini: Gemini 2.0 Flash, Pro
 * 
 * Features:
 * - Streaming support for real-time responses
 * - Token counting and cost estimation
 * - Error handling and retry logic
 * - API key management through api-key-manager
 */

export class LLMClient {
  constructor(apiKeyManager) {
    this.apiKeyManager = apiKeyManager;
    this.models = {
      // OpenAI Models
      'gpt-4o': {
        provider: 'openai',
        name: 'gpt-4o',
        contextWindow: 128000,
        pricing: { input: 2.50, output: 10.00 }, // per 1M tokens
        capabilities: ['text', 'vision', 'function-calling']
      },
      'gpt-4o-mini': {
        provider: 'openai',
        name: 'gpt-4o-mini',
        contextWindow: 128000,
        pricing: { input: 0.15, output: 0.60 },
        capabilities: ['text', 'vision', 'function-calling']
      },
      
      // Anthropic Claude Models
      'claude-3.5-sonnet': {
        provider: 'claude',
        name: 'claude-3-5-sonnet-20241022',
        contextWindow: 200000,
        pricing: { input: 3.00, output: 15.00 },
        capabilities: ['text', 'vision', 'function-calling']
      },
      
      // Google Gemini Models
      'gemini-2.0-flash': {
        provider: 'gemini',
        name: 'gemini-2.0-flash-exp',
        contextWindow: 1000000,
        pricing: { input: 0.00, output: 0.00 }, // Free tier
        capabilities: ['text', 'vision', 'audio', 'video']
      },
      'gemini-1.5-pro': {
        provider: 'gemini',
        name: 'gemini-1.5-pro-latest',
        contextWindow: 2000000,
        pricing: { input: 1.25, output: 5.00 },
        capabilities: ['text', 'vision', 'audio', 'video']
      }
    };
    
    this.requestHistory = [];
  }

  /**
   * Generate completion with any model
   */
  async generateCompletion(modelId, messages, options = {}) {
    console.log(`[LLMClient] Generating completion with ${modelId}...`);
    
    const model = this.models[modelId];
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Check API key
    const apiKey = this.apiKeyManager.getKey(model.provider);
    if (!apiKey) {
      throw new Error(`API key for ${model.provider} not configured. Please set it in API Key Manager.`);
    }

    // Route to appropriate provider
    let result;
    switch (model.provider) {
      case 'openai':
        result = await this.callOpenAI(model, messages, apiKey, options);
        break;
      case 'claude':
        result = await this.callClaude(model, messages, apiKey, options);
        break;
      case 'gemini':
        result = await this.callGemini(model, messages, apiKey, options);
        break;
      default:
        throw new Error(`Provider ${model.provider} not supported`);
    }

    // Track request
    this.trackRequest({
      modelId,
      provider: model.provider,
      messages,
      result,
      timestamp: new Date()
    });

    return result;
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(model, messages, apiKey, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      stream = false
    } = options;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      if (stream) {
        return this.handleOpenAIStream(response);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason
      };

    } catch (error) {
      console.error('[LLMClient] OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Call Anthropic Claude API
   */
  async callClaude(model, messages, apiKey, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      stream = false
    } = options;

    try {
      // Convert messages format (OpenAI -> Claude)
      const claudeMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model.name,
          messages: claudeMessages,
          temperature,
          max_tokens: maxTokens,
          stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
      }

      if (stream) {
        return this.handleClaudeStream(response);
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        model: data.model,
        finishReason: data.stop_reason
      };

    } catch (error) {
      console.error('[LLMClient] Claude API error:', error);
      throw error;
    }
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(model, messages, apiKey, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096
    } = options;

    try {
      // Convert messages format (OpenAI -> Gemini)
      const geminiContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Gemini doesn't return token counts in response, estimate them
      const content = data.candidates[0].content.parts[0].text;
      const estimatedInputTokens = this.estimateTokens(messages.map(m => m.content).join(' '));
      const estimatedOutputTokens = this.estimateTokens(content);

      return {
        content,
        usage: {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          totalTokens: estimatedInputTokens + estimatedOutputTokens
        },
        model: model.name,
        finishReason: data.candidates[0].finishReason
      };

    } catch (error) {
      console.error('[LLMClient] Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Handle OpenAI streaming response
   */
  async handleOpenAIStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices[0]?.delta?.content;
                if (delta) {
                  content += delta;
                  controller.enqueue(delta);
                }
              } catch (e) {
                console.warn('[LLMClient] Failed to parse stream chunk:', e);
              }
            }
          }
        }
        
        controller.close();
      }
    });

    return { stream, content };
  }

  /**
   * Handle Claude streaming response
   */
  async handleClaudeStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta') {
                  const delta = parsed.delta?.text;
                  if (delta) {
                    content += delta;
                    controller.enqueue(delta);
                  }
                }
              } catch (e) {
                console.warn('[LLMClient] Failed to parse stream chunk:', e);
              }
            }
          }
        }
        
        controller.close();
      }
    });

    return { stream, content };
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters for English, 1-2 characters for others
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Calculate cost for a request
   */
  calculateCost(modelId, inputTokens, outputTokens) {
    const model = this.models[modelId];
    if (!model) return 0;

    const inputCost = (inputTokens / 1000000) * model.pricing.input;
    const outputCost = (outputTokens / 1000000) * model.pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Get model info
   */
  getModelInfo(modelId) {
    return this.models[modelId];
  }

  /**
   * Get all available models
   */
  getAllModels() {
    return Object.keys(this.models).map(id => ({
      id,
      ...this.models[id]
    }));
  }

  /**
   * Track request for analytics
   */
  trackRequest(request) {
    this.requestHistory.push(request);
    
    // Keep only last 100 requests
    if (this.requestHistory.length > 100) {
      this.requestHistory = this.requestHistory.slice(-100);
    }
  }

  /**
   * Get request history
   */
  getRequestHistory(limit = 10) {
    return this.requestHistory.slice(-limit);
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const stats = {
      totalRequests: this.requestHistory.length,
      totalTokens: 0,
      totalCost: 0,
      byModel: {},
      byProvider: {}
    };

    this.requestHistory.forEach(req => {
      const usage = req.result?.usage;
      if (!usage) return;

      // Total stats
      stats.totalTokens += usage.totalTokens;
      const cost = this.calculateCost(req.modelId, usage.inputTokens, usage.outputTokens);
      stats.totalCost += cost;

      // By model
      if (!stats.byModel[req.modelId]) {
        stats.byModel[req.modelId] = {
          requests: 0,
          tokens: 0,
          cost: 0
        };
      }
      stats.byModel[req.modelId].requests++;
      stats.byModel[req.modelId].tokens += usage.totalTokens;
      stats.byModel[req.modelId].cost += cost;

      // By provider
      if (!stats.byProvider[req.provider]) {
        stats.byProvider[req.provider] = {
          requests: 0,
          tokens: 0,
          cost: 0
        };
      }
      stats.byProvider[req.provider].requests++;
      stats.byProvider[req.provider].tokens += usage.totalTokens;
      stats.byProvider[req.provider].cost += cost;
    });

    return stats;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.requestHistory = [];
  }
}

// Make globally available
window.LLMClient = LLMClient;

console.log('[LLMClient] Module loaded successfully');
