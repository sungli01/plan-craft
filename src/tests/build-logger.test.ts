/**
 * Unit Tests for Build Logger
 * Target: 95%+ Test Coverage
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  BuildLogger,
  LogLevel,
  BuildEventEmitter,
  BuildEventType
} from '../core/build-logger';

describe('BuildLogger', () => {
  let logger: BuildLogger;

  beforeEach(() => {
    logger = new BuildLogger();
  });

  describe('Log Entry Creation', () => {
    it('should create log entry with all fields', () => {
      const entry = logger.log(
        LogLevel.INFO,
        'tech-lead',
        'G1',
        'Starting phase',
        { extra: 'data' }
      );

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.source).toBe('tech-lead');
      expect(entry.phase).toBe('G1');
      expect(entry.message).toBe('Starting phase');
      expect(entry.metadata).toEqual({ extra: 'data' });
    });

    it('should create debug log', () => {
      const entry = logger.debug('dev', 'G2', 'Debug message');
      expect(entry.level).toBe(LogLevel.DEBUG);
    });

    it('should create info log', () => {
      const entry = logger.info('dev', 'G2', 'Info message');
      expect(entry.level).toBe(LogLevel.INFO);
    });

    it('should create warn log', () => {
      const entry = logger.warn('qa', 'G5', 'Warning message');
      expect(entry.level).toBe(LogLevel.WARN);
    });

    it('should create error log', () => {
      const entry = logger.error('dev', 'G1', 'Error message');
      expect(entry.level).toBe(LogLevel.ERROR);
    });

    it('should create success log', () => {
      const entry = logger.success('ops', 'G8', 'Deployed successfully');
      expect(entry.level).toBe(LogLevel.SUCCESS);
    });
  });

  describe('Log Storage', () => {
    it('should store logs in order', () => {
      logger.info('dev', 'G1', 'First');
      logger.info('dev', 'G1', 'Second');
      logger.info('dev', 'G1', 'Third');

      const logs = logger.getLogs();
      expect(logs.length).toBe(3);
      expect(logs[0].message).toBe('First');
      expect(logs[2].message).toBe('Third');
    });

    it('should limit logs to max size', () => {
      // Create more than 1000 logs
      for (let i = 0; i < 1100; i++) {
        logger.info('dev', 'G1', `Log ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Log Filtering', () => {
    beforeEach(() => {
      logger.info('dev', 'G1', 'Dev G1 message');
      logger.error('dev', 'G2', 'Dev G2 error');
      logger.info('qa', 'G5', 'QA G5 message');
      logger.success('ops', 'G8', 'Ops G8 success');
    });

    it('should filter by level', () => {
      const errors = logger.getLogs({ level: LogLevel.ERROR });
      expect(errors.length).toBe(1);
      expect(errors[0].level).toBe(LogLevel.ERROR);
    });

    it('should filter by source', () => {
      const devLogs = logger.getLogs({ source: 'dev' });
      expect(devLogs.length).toBe(2);
      expect(devLogs.every(log => log.source === 'dev')).toBe(true);
    });

    it('should filter by phase', () => {
      const g1Logs = logger.getLogs({ phase: 'G1' });
      expect(g1Logs.length).toBe(1);
      expect(g1Logs[0].phase).toBe('G1');
    });

    it('should filter by timestamp', () => {
      // Clear any previous logs first
      logger.clear();
      
      logger.info('dev', 'G1', 'Old log 1');
      logger.info('dev', 'G1', 'Old log 2');
      
      const now = Date.now() + 1000; // Future timestamp
      
      logger.info('dev', 'G1', 'New log');

      const oldLogs = logger.getLogs({ since: 0 });
      expect(oldLogs.length).toBe(3);
      
      const recentLogs = logger.getLogs({ since: now });
      expect(recentLogs.length).toBe(0); // No logs after future timestamp
    });

    it('should combine multiple filters', () => {
      const filtered = logger.getLogs({
        source: 'dev',
        level: LogLevel.ERROR
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].source).toBe('dev');
      expect(filtered[0].level).toBe(LogLevel.ERROR);
    });
  });

  describe('Recent Logs', () => {
    it('should return recent logs', () => {
      for (let i = 0; i < 100; i++) {
        logger.info('dev', 'G1', `Log ${i}`);
      }

      const recent = logger.getRecentLogs(10);
      expect(recent.length).toBe(10);
      expect(recent[recent.length - 1].message).toBe('Log 99');
    });

    it('should handle count larger than total logs', () => {
      logger.info('dev', 'G1', 'Only log');
      const recent = logger.getRecentLogs(100);
      expect(recent.length).toBe(1);
    });
  });

  describe('Log Export', () => {
    it('should export logs as formatted text', () => {
      logger.info('dev', 'G1', 'First message');
      logger.error('qa', 'G5', 'Error message');

      const exported = logger.exportLogs();
      expect(exported).toContain('INFO');
      expect(exported).toContain('First message');
      expect(exported).toContain('ERROR');
      expect(exported).toContain('Error message');
    });

    it('should include metadata in export', () => {
      logger.info('dev', 'G1', 'Message', { key: 'value' });
      const exported = logger.exportLogs();
      expect(exported).toContain('"key":"value"');
    });
  });

  describe('Clear Logs', () => {
    it('should clear all logs', () => {
      logger.info('dev', 'G1', 'Log 1');
      logger.info('dev', 'G1', 'Log 2');
      
      logger.clear();
      const logs = logger.getLogs();
      expect(logs.length).toBe(0);
    });
  });
});

describe('BuildEventEmitter', () => {
  let emitter: BuildEventEmitter;

  beforeEach(() => {
    emitter = new BuildEventEmitter();
  });

  it('should emit events to registered handlers', () => {
    let receivedEvent: any = null;
    
    emitter.on('phase_started', (event) => {
      receivedEvent = event;
    });

    emitter.emit('phase_started', { phase: 'G1' });

    expect(receivedEvent).toBeDefined();
    expect(receivedEvent.type).toBe('phase_started');
    expect(receivedEvent.data.phase).toBe('G1');
  });

  it('should support multiple handlers for same event', () => {
    let handler1Called = false;
    let handler2Called = false;

    emitter.on('build_completed', () => { handler1Called = true; });
    emitter.on('build_completed', () => { handler2Called = true; });

    emitter.emit('build_completed', {});

    expect(handler1Called).toBe(true);
    expect(handler2Called).toBe(true);
  });

  it('should remove event handler', () => {
    let called = false;
    const handler = () => { called = true; };

    emitter.on('test_running', handler);
    emitter.off('test_running', handler);
    emitter.emit('test_running', {});

    expect(called).toBe(false);
  });

  it('should handle errors in event handlers gracefully', () => {
    emitter.on('phase_failed', () => {
      throw new Error('Handler error');
    });

    // Should not throw
    expect(() => {
      emitter.emit('phase_failed', {});
    }).not.toThrow();
  });

  it('should clear all handlers', () => {
    let called = false;
    emitter.on('deployment_completed', () => { called = true; });
    
    emitter.clear();
    emitter.emit('deployment_completed', {});

    expect(called).toBe(false);
  });

  it('should include timestamp in events', () => {
    let receivedEvent: any = null;
    emitter.on('code_generated', (event) => {
      receivedEvent = event;
    });

    emitter.emit('code_generated', { file: 'index.ts' });

    expect(receivedEvent.timestamp).toBeDefined();
    expect(typeof receivedEvent.timestamp).toBe('number');
  });
});
