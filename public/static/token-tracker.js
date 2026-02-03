/**
 * Plan-Craft v7.2.0 Token Tracker
 * 
 * Purpose: Real-time token usage monitoring and cost estimation
 * - Track token usage per request, agent, and model
 * - Calculate costs in real-time
 * - Budget alerts and limits
 * - Usage analytics and reporting
 */

export class TokenTracker {
  constructor(llmClient) {
    this.llmClient = llmClient;
    this.sessions = [];
    this.currentSession = null;
    this.budgetLimit = null; // null = unlimited
    this.budgetAlertThreshold = 0.8; // Alert at 80%
    
    // Load saved data
    this.loadFromStorage();
  }

  /**
   * Start new tracking session
   */
  startSession(projectName, metadata = {}) {
    console.log(`[TokenTracker] Starting session for: ${projectName}`);

    this.currentSession = {
      id: this.generateSessionId(),
      projectName,
      metadata,
      startTime: new Date(),
      endTime: null,
      requests: [],
      totalTokens: {
        input: 0,
        output: 0,
        total: 0
      },
      totalCost: 0,
      byModel: {},
      byAgent: {}
    };

    this.sessions.push(this.currentSession);
    this.saveToStorage();

    return this.currentSession.id;
  }

  /**
   * End current session
   */
  endSession() {
    if (!this.currentSession) {
      console.warn('[TokenTracker] No active session to end');
      return null;
    }

    console.log(`[TokenTracker] Ending session: ${this.currentSession.projectName}`);

    this.currentSession.endTime = new Date();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    const summary = this.getSessionSummary(this.currentSession.id);
    
    this.currentSession = null;
    this.saveToStorage();

    return summary;
  }

  /**
   * Track a request
   */
  trackRequest(modelId, usage, agentName = 'Unknown', sectionId = null) {
    if (!this.currentSession) {
      console.warn('[TokenTracker] No active session, cannot track request');
      return;
    }

    console.log(`[TokenTracker] Tracking request: ${modelId} (${usage.inputTokens} in, ${usage.outputTokens} out)`);

    const cost = this.llmClient.calculateCost(modelId, usage.inputTokens, usage.outputTokens);

    const request = {
      timestamp: new Date(),
      modelId,
      agentName,
      sectionId,
      usage: {
        input: usage.inputTokens,
        output: usage.outputTokens,
        total: usage.totalTokens
      },
      cost
    };

    // Add to session
    this.currentSession.requests.push(request);

    // Update session totals
    this.currentSession.totalTokens.input += usage.inputTokens;
    this.currentSession.totalTokens.output += usage.outputTokens;
    this.currentSession.totalTokens.total += usage.totalTokens;
    this.currentSession.totalCost += cost;

    // Update by model
    if (!this.currentSession.byModel[modelId]) {
      this.currentSession.byModel[modelId] = {
        requests: 0,
        tokens: { input: 0, output: 0, total: 0 },
        cost: 0
      };
    }
    this.currentSession.byModel[modelId].requests++;
    this.currentSession.byModel[modelId].tokens.input += usage.inputTokens;
    this.currentSession.byModel[modelId].tokens.output += usage.outputTokens;
    this.currentSession.byModel[modelId].tokens.total += usage.totalTokens;
    this.currentSession.byModel[modelId].cost += cost;

    // Update by agent
    if (!this.currentSession.byAgent[agentName]) {
      this.currentSession.byAgent[agentName] = {
        requests: 0,
        tokens: { input: 0, output: 0, total: 0 },
        cost: 0
      };
    }
    this.currentSession.byAgent[agentName].requests++;
    this.currentSession.byAgent[agentName].tokens.input += usage.inputTokens;
    this.currentSession.byAgent[agentName].tokens.output += usage.outputTokens;
    this.currentSession.byAgent[agentName].tokens.total += usage.totalTokens;
    this.currentSession.byAgent[agentName].cost += cost;

    // Check budget
    this.checkBudget();

    // Save to storage
    this.saveToStorage();

    return request;
  }

  /**
   * Check budget and alert if threshold reached
   */
  checkBudget() {
    if (!this.budgetLimit || !this.currentSession) return;

    const usage = this.currentSession.totalCost / this.budgetLimit;

    if (usage >= 1.0) {
      console.error('[TokenTracker] ⚠️ BUDGET LIMIT EXCEEDED!');
      this.emitBudgetAlert('exceeded', usage);
    } else if (usage >= this.budgetAlertThreshold) {
      console.warn(`[TokenTracker] ⚠️ Budget threshold reached: ${(usage * 100).toFixed(1)}%`);
      this.emitBudgetAlert('threshold', usage);
    }
  }

  /**
   * Emit budget alert
   */
  emitBudgetAlert(type, usage) {
    const event = new CustomEvent('tokenTracker:budgetAlert', {
      detail: {
        type, // 'threshold' or 'exceeded'
        usage: (usage * 100).toFixed(1) + '%',
        currentCost: this.currentSession.totalCost,
        budgetLimit: this.budgetLimit,
        remaining: Math.max(0, this.budgetLimit - this.currentSession.totalCost)
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Set budget limit
   */
  setBudgetLimit(limit, alertThreshold = 0.8) {
    this.budgetLimit = limit;
    this.budgetAlertThreshold = alertThreshold;
    console.log(`[TokenTracker] Budget limit set to $${limit} (alert at ${alertThreshold * 100}%)`);
    this.saveToStorage();
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId = null) {
    const session = sessionId 
      ? this.sessions.find(s => s.id === sessionId)
      : this.currentSession;

    if (!session) return null;

    return {
      id: session.id,
      projectName: session.projectName,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration || (new Date() - session.startTime),
      totalRequests: session.requests.length,
      totalTokens: session.totalTokens,
      totalCost: session.totalCost,
      averageCostPerRequest: session.requests.length > 0 
        ? session.totalCost / session.requests.length 
        : 0,
      byModel: session.byModel,
      byAgent: session.byAgent,
      budgetUsage: this.budgetLimit 
        ? (session.totalCost / this.budgetLimit * 100).toFixed(1) + '%'
        : 'unlimited'
    };
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return this.sessions.map(s => this.getSessionSummary(s.id));
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.sessions.find(s => s.id === sessionId);
  }

  /**
   * Get total usage across all sessions
   */
  getTotalUsage() {
    const total = {
      sessions: this.sessions.length,
      totalRequests: 0,
      totalTokens: { input: 0, output: 0, total: 0 },
      totalCost: 0,
      byModel: {},
      byAgent: {}
    };

    this.sessions.forEach(session => {
      total.totalRequests += session.requests.length;
      total.totalTokens.input += session.totalTokens.input;
      total.totalTokens.output += session.totalTokens.output;
      total.totalTokens.total += session.totalTokens.total;
      total.totalCost += session.totalCost;

      // Aggregate by model
      Object.keys(session.byModel).forEach(modelId => {
        if (!total.byModel[modelId]) {
          total.byModel[modelId] = {
            requests: 0,
            tokens: { input: 0, output: 0, total: 0 },
            cost: 0
          };
        }
        const modelData = session.byModel[modelId];
        total.byModel[modelId].requests += modelData.requests;
        total.byModel[modelId].tokens.input += modelData.tokens.input;
        total.byModel[modelId].tokens.output += modelData.tokens.output;
        total.byModel[modelId].tokens.total += modelData.tokens.total;
        total.byModel[modelId].cost += modelData.cost;
      });

      // Aggregate by agent
      Object.keys(session.byAgent).forEach(agentName => {
        if (!total.byAgent[agentName]) {
          total.byAgent[agentName] = {
            requests: 0,
            tokens: { input: 0, output: 0, total: 0 },
            cost: 0
          };
        }
        const agentData = session.byAgent[agentName];
        total.byAgent[agentName].requests += agentData.requests;
        total.byAgent[agentName].tokens.input += agentData.tokens.input;
        total.byAgent[agentName].tokens.output += agentData.tokens.output;
        total.byAgent[agentName].tokens.total += agentData.tokens.total;
        total.byAgent[agentName].cost += agentData.cost;
      });
    });

    return total;
  }

  /**
   * Generate chart data for visualization
   */
  generateChartData(sessionId = null) {
    const session = sessionId 
      ? this.getSession(sessionId)
      : this.currentSession;

    if (!session) return null;

    return {
      // Cost by model (pie chart)
      costByModel: {
        labels: Object.keys(session.byModel),
        data: Object.values(session.byModel).map(m => m.cost)
      },
      
      // Tokens by agent (bar chart)
      tokensByAgent: {
        labels: Object.keys(session.byAgent),
        data: Object.values(session.byAgent).map(a => a.tokens.total)
      },
      
      // Cost over time (line chart)
      costOverTime: {
        labels: session.requests.map((r, i) => `Request ${i + 1}`),
        data: session.requests.reduce((acc, r) => {
          const prevTotal = acc.length > 0 ? acc[acc.length - 1] : 0;
          acc.push(prevTotal + r.cost);
          return acc;
        }, [])
      },
      
      // Token distribution
      tokenDistribution: {
        labels: ['Input Tokens', 'Output Tokens'],
        data: [session.totalTokens.input, session.totalTokens.output]
      }
    };
  }

  /**
   * Export session as CSV
   */
  exportSessionCSV(sessionId = null) {
    const session = sessionId 
      ? this.getSession(sessionId)
      : this.currentSession;

    if (!session) return null;

    const rows = [
      ['Timestamp', 'Model', 'Agent', 'Section', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost ($)']
    ];

    session.requests.forEach(req => {
      rows.push([
        req.timestamp.toISOString(),
        req.modelId,
        req.agentName,
        req.sectionId || 'N/A',
        req.usage.input,
        req.usage.output,
        req.usage.total,
        req.cost.toFixed(6)
      ]);
    });

    // Add summary row
    rows.push([]);
    rows.push(['TOTAL', '', '', '', 
      session.totalTokens.input, 
      session.totalTokens.output, 
      session.totalTokens.total, 
      session.totalCost.toFixed(6)
    ]);

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        sessions: this.sessions.map(s => ({
          ...s,
          startTime: s.startTime.toISOString(),
          endTime: s.endTime ? s.endTime.toISOString() : null
        })),
        currentSessionId: this.currentSession?.id || null,
        budgetLimit: this.budgetLimit,
        budgetAlertThreshold: this.budgetAlertThreshold
      };

      localStorage.setItem('plancraft_token_tracker', JSON.stringify(data));
    } catch (error) {
      console.warn('[TokenTracker] Failed to save to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('plancraft_token_tracker');
      if (!saved) return;

      const data = JSON.parse(saved);
      
      // Restore sessions
      this.sessions = data.sessions.map(s => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : null
      }));

      // Restore current session
      if (data.currentSessionId) {
        this.currentSession = this.sessions.find(s => s.id === data.currentSessionId);
      }

      // Restore budget
      this.budgetLimit = data.budgetLimit;
      this.budgetAlertThreshold = data.budgetAlertThreshold;

      console.log(`[TokenTracker] Loaded ${this.sessions.length} sessions from storage`);
    } catch (error) {
      console.warn('[TokenTracker] Failed to load from storage:', error);
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.sessions = [];
    this.currentSession = null;
    this.budgetLimit = null;
    this.saveToStorage();
    console.log('[TokenTracker] All data cleared');
  }

  /**
   * Clear old sessions (keep last N)
   */
  clearOldSessions(keepLast = 10) {
    if (this.sessions.length <= keepLast) return;

    // Sort by start time (newest first)
    this.sessions.sort((a, b) => b.startTime - a.startTime);
    
    // Keep only last N sessions
    this.sessions = this.sessions.slice(0, keepLast);
    
    // If current session was removed, clear it
    if (this.currentSession && !this.sessions.find(s => s.id === this.currentSession.id)) {
      this.currentSession = null;
    }

    this.saveToStorage();
    console.log(`[TokenTracker] Cleared old sessions, kept last ${keepLast}`);
  }
}

// Make globally available
window.TokenTracker = TokenTracker;

console.log('[TokenTracker] Module loaded successfully');
