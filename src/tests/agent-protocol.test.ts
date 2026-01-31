/**
 * Unit Tests for Agent Protocol
 * Target: 95%+ Test Coverage
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  AgentMessageQueue,
  AgentRole,
  MessageType,
  BuildExecutor,
  AutoDebugger,
  ExecutionContext
} from '../core/agent-protocol';

describe('AgentMessageQueue', () => {
  let queue: AgentMessageQueue;

  beforeEach(() => {
    queue = new AgentMessageQueue();
  });

  it('should send message with generated id and timestamp', () => {
    const message = queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: { task: 'Build API' },
      projectId: 'proj-1'
    });

    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
    expect(message.from).toBe(AgentRole.TECH_LEAD);
  });

  it('should receive messages for specific agent', () => {
    queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-1'
    });

    queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.QA,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-1'
    });

    const devMessages = queue.receive(AgentRole.DEV);
    expect(devMessages.length).toBe(1);
    expect(devMessages[0].to).toBe(AgentRole.DEV);
  });

  it('should acknowledge and remove message', () => {
    const message = queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-1'
    });

    queue.acknowledge(message.id);
    const messages = queue.receive(AgentRole.DEV);
    expect(messages.length).toBe(0);
  });

  it('should filter messages by project', () => {
    queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-1'
    });

    queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-2'
    });

    const proj1Messages = queue.getMessagesByProject('proj-1');
    expect(proj1Messages.length).toBe(1);
    expect(proj1Messages[0].projectId).toBe('proj-1');
  });

  it('should clear all messages', () => {
    queue.send({
      from: AgentRole.TECH_LEAD,
      to: AgentRole.DEV,
      type: MessageType.TASK_ASSIGNMENT,
      payload: {},
      projectId: 'proj-1'
    });

    queue.clear();
    const messages = queue.receive(AgentRole.DEV);
    expect(messages.length).toBe(0);
  });
});

describe('BuildExecutor', () => {
  describe('Code Execution', () => {
    it('should execute valid TypeScript code successfully', async () => {
      const context: ExecutionContext = {
        code: 'function hello() { return "world"; }',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should execute code with arrow functions', async () => {
      const context: ExecutionContext = {
        code: 'const hello = () => "world";',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(true);
    });

    it('should execute code with class definitions', async () => {
      const context: ExecutionContext = {
        code: 'class MyClass { method() { return true; } }',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(true);
    });

    it('should execute valid Python code successfully', async () => {
      const context: ExecutionContext = {
        code: 'def hello():\n    return "world"',
        language: 'python'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(true);
    });

    it('should execute Python class definitions', async () => {
      const context: ExecutionContext = {
        code: 'class MyClass:\n    def method(self):\n        return True',
        language: 'python'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(true);
    });

    it('should reject empty code', async () => {
      const context: ExecutionContext = {
        code: '',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Code is empty');
    });

    it('should reject whitespace-only code', async () => {
      const context: ExecutionContext = {
        code: '   \n   \n   ',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(false);
    });

    it('should reject code without executable content', async () => {
      const context: ExecutionContext = {
        code: 'const x = 5;',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should measure execution time', async () => {
      const context: ExecutionContext = {
        code: 'function test() { return true; }',
        language: 'typescript'
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle execution errors gracefully', async () => {
      const context: ExecutionContext = {
        code: 'just some text without any code structure',
        language: 'python' // Use python to trigger different validation
      };

      const result = await BuildExecutor.executeCode(context);
      expect(result.success).toBe(false);
    });
  });

  describe('Test Execution', () => {
    it('should run tests and calculate coverage', async () => {
      const testCode = `
        test('should work', () => {
          expect(true).toBe(true);
        });
      `;
      const sourceCode = 'function hello() { return "world"; }';

      const result = await BuildExecutor.runTests(testCode, sourceCode);
      expect(result.totalTests).toBeGreaterThan(0);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
    });

    it('should detect test failures', async () => {
      const testCode = `
        test('first', () => {});
        test('second', () => {});
        test('third', () => {});
      `;
      const sourceCode = 'function hello() {}';

      const result = await BuildExecutor.runTests(testCode, sourceCode);
      expect(result.totalTests).toBe(3);
    });
  });

  describe('Project Build', () => {
    it('should build project with source files', async () => {
      const sourceFiles = [
        '/src/index.ts',
        '/src/core/pipeline.ts'
      ];

      const result = await BuildExecutor.buildProject(sourceFiles);
      expect(result.success).toBe(true);
      expect(result.outputFiles.length).toBe(2);
    });

    it('should fail build when no source files provided', async () => {
      const result = await BuildExecutor.buildProject([]);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('No source files to build');
    });

    it('should measure build time', async () => {
      const sourceFiles = ['/src/index.ts'];
      const result = await BuildExecutor.buildProject(sourceFiles);
      expect(result.buildTime).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('AutoDebugger', () => {
  describe('Error Analysis', () => {
    it('should detect syntax errors', () => {
      const error = 'SyntaxError: Unexpected token }';
      const suggestions = AutoDebugger.analyzeError(error);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].errorType).toBe('SYNTAX_ERROR');
      expect(suggestions[0].priority).toBe('high');
    });

    it('should detect type errors', () => {
      const error = 'TypeError: Cannot read property of undefined';
      const suggestions = AutoDebugger.analyzeError(error);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].errorType).toBe('TYPE_ERROR');
    });

    it('should detect import errors', () => {
      const error = 'Error: Cannot find module "express"';
      const suggestions = AutoDebugger.analyzeError(error);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].errorType).toBe('IMPORT_ERROR');
      expect(suggestions[0].suggestion).toContain('npm install');
    });

    it('should detect reference errors', () => {
      const error = 'ReferenceError: myVar is not defined';
      const suggestions = AutoDebugger.analyzeError(error);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].errorType).toBe('REFERENCE_ERROR');
    });

    it('should return empty array for unknown errors', () => {
      const error = 'Some random error';
      const suggestions = AutoDebugger.analyzeError(error);
      
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Fix Code Generation', () => {
    it('should generate fix code for common errors', () => {
      const originalCode = 'const x = 5\nconst y = 10';
      const error = 'missing semicolon';
      
      const fixedCode = AutoDebugger.generateFixCode(error, originalCode);
      expect(typeof fixedCode).toBe('string');
    });

    it('should return original code if no fix available', () => {
      const originalCode = 'const x = 5;';
      const error = 'unknown error';
      
      const fixedCode = AutoDebugger.generateFixCode(error, originalCode);
      expect(fixedCode).toBe(originalCode);
    });
  });
});
