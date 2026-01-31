/**
 * Agent Communication Protocol
 * Defines how agents (Tech Lead, Dev, QA, Ops) communicate
 */

export enum AgentRole {
  TECH_LEAD = 'TECH_LEAD',
  DEV = 'DEV',
  QA = 'QA',
  OPS = 'OPS'
}

export enum MessageType {
  TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
  CODE_SUBMISSION = 'CODE_SUBMISSION',
  TEST_RESULT = 'TEST_RESULT',
  BUILD_RESULT = 'BUILD_RESULT',
  DEPLOY_RESULT = 'DEPLOY_RESULT',
  ERROR_REPORT = 'ERROR_REPORT',
  STATUS_UPDATE = 'STATUS_UPDATE'
}

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole;
  type: MessageType;
  payload: any;
  timestamp: number;
  projectId: string;
}

export interface TaskAssignment {
  taskId: string;
  phase: string;
  description: string;
  requirements: string[];
  deadline?: number;
}

export interface CodeSubmission {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  commitMessage: string;
  relatedPhase: string;
}

export interface TestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  failures: Array<{
    testName: string;
    error: string;
  }>;
}

export interface BuildResult {
  success: boolean;
  buildTime: number;
  errors: string[];
  warnings: string[];
  outputFiles: string[];
}

/**
 * Agent Message Queue
 */
export class AgentMessageQueue {
  private messages: AgentMessage[] = [];

  send(message: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now()
    };
    this.messages.push(fullMessage);
    return fullMessage;
  }

  receive(agentRole: AgentRole): AgentMessage[] {
    return this.messages.filter(m => m.to === agentRole);
  }

  acknowledge(messageId: string): void {
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  getMessagesByProject(projectId: string): AgentMessage[] {
    return this.messages.filter(m => m.projectId === projectId);
  }

  clear(): void {
    this.messages = [];
  }
}

/**
 * Build Executor
 * Simulates code execution and testing
 */
export interface ExecutionContext {
  code: string;
  language: string;
  testCode?: string;
  dependencies?: string[];
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsed: number;
}

export class BuildExecutor {
  /**
   * Execute code and return result
   */
  static async executeCode(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Simulate code execution
      // In real implementation, this would use sandboxed environment
      const errors = this.validateCode(context.code, context.language);
      
      if (errors.length > 0) {
        return {
          success: false,
          output: '',
          errors,
          executionTime: Date.now() - startTime,
          memoryUsed: 0
        };
      }

      return {
        success: true,
        output: 'Code executed successfully',
        errors: [],
        executionTime: Date.now() - startTime,
        memoryUsed: Math.random() * 100 // Simulated MB
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime: Date.now() - startTime,
        memoryUsed: 0
      };
    }
  }

  /**
   * Run tests and calculate coverage
   */
  static async runTests(testCode: string, sourceCode: string): Promise<TestResult> {
    // Simulate test execution
    const totalTests = this.countTests(testCode);
    const passedTests = Math.floor(totalTests * 0.95); // 95% pass rate for now
    
    return {
      passed: passedTests === totalTests,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      coverage: 95.0, // Hardcoded for G1, will be dynamic later
      failures: []
    };
  }

  /**
   * Basic code validation (syntax check simulation)
   */
  private static validateCode(code: string, language: string): string[] {
    const errors: string[] = [];

    // Check for empty code
    if (!code || code.trim().length === 0) {
      errors.push('Code is empty');
      return errors;
    }

    // Language-specific basic checks
    switch (language) {
      case 'typescript':
      case 'javascript':
        if (!code.includes('function') && !code.includes('=>') && !code.includes('class')) {
          errors.push('No executable code found');
        }
        break;
      case 'python':
        if (!code.includes('def') && !code.includes('class')) {
          errors.push('No executable code found');
        }
        break;
    }

    return errors;
  }

  /**
   * Count test functions
   */
  private static countTests(testCode: string): number {
    const testMatches = testCode.match(/test\s*\(/g) || [];
    const itMatches = testCode.match(/it\s*\(/g) || [];
    return testMatches.length + itMatches.length;
  }

  /**
   * Build project (compile, bundle, etc.)
   */
  static async buildProject(sourceFiles: string[]): Promise<BuildResult> {
    const startTime = Date.now();
    
    try {
      // Simulate build process
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if files exist
      if (sourceFiles.length === 0) {
        errors.push('No source files to build');
      }

      return {
        success: errors.length === 0,
        buildTime: Date.now() - startTime,
        errors,
        warnings,
        outputFiles: sourceFiles.map(f => f.replace('/src/', '/dist/'))
      };
    } catch (error) {
      return {
        success: false,
        buildTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        outputFiles: []
      };
    }
  }
}

/**
 * Auto-Debugger
 * Analyzes errors and suggests fixes
 */
export interface DebugSuggestion {
  errorType: string;
  suggestion: string;
  fixCode?: string;
  priority: 'high' | 'medium' | 'low';
}

export class AutoDebugger {
  static analyzeError(error: string): DebugSuggestion[] {
    const suggestions: DebugSuggestion[] = [];

    // Syntax errors
    if (error.includes('SyntaxError') || error.includes('Unexpected token')) {
      suggestions.push({
        errorType: 'SYNTAX_ERROR',
        suggestion: 'Check for missing brackets, semicolons, or typos',
        priority: 'high'
      });
    }

    // Type errors
    if (error.includes('TypeError') || error.includes('is not a function')) {
      suggestions.push({
        errorType: 'TYPE_ERROR',
        suggestion: 'Verify variable types and function definitions',
        priority: 'high'
      });
    }

    // Import errors
    if (error.includes('Cannot find module') || error.includes('Module not found')) {
      suggestions.push({
        errorType: 'IMPORT_ERROR',
        suggestion: 'Check if module is installed: npm install <module>',
        priority: 'high'
      });
    }

    // Reference errors
    if (error.includes('ReferenceError') || error.includes('is not defined')) {
      suggestions.push({
        errorType: 'REFERENCE_ERROR',
        suggestion: 'Variable or function is not declared. Check scope and imports.',
        priority: 'high'
      });
    }

    return suggestions;
  }

  static generateFixCode(error: string, originalCode: string): string {
    // Simple fix generation (would be more sophisticated in production)
    if (error.includes('missing semicolon')) {
      return originalCode.replace(/\n/g, ';\n');
    }
    
    return originalCode;
  }
}
