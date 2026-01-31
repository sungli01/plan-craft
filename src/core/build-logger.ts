/**
 * Build Logger
 * Real-time streaming of build logs and events
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string; // tech-lead, dev, qa, ops
  phase: string;
  message: string;
  metadata?: Record<string, any>;
}

export class BuildLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  log(
    level: LogLevel,
    source: string,
    phase: string,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      source,
      phase,
      message,
      metadata
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return entry;
  }

  debug(source: string, phase: string, message: string, metadata?: Record<string, any>): LogEntry {
    return this.log(LogLevel.DEBUG, source, phase, message, metadata);
  }

  info(source: string, phase: string, message: string, metadata?: Record<string, any>): LogEntry {
    return this.log(LogLevel.INFO, source, phase, message, metadata);
  }

  warn(source: string, phase: string, message: string, metadata?: Record<string, any>): LogEntry {
    return this.log(LogLevel.WARN, source, phase, message, metadata);
  }

  error(source: string, phase: string, message: string, metadata?: Record<string, any>): LogEntry {
    return this.log(LogLevel.ERROR, source, phase, message, metadata);
  }

  success(source: string, phase: string, message: string, metadata?: Record<string, any>): LogEntry {
    return this.log(LogLevel.SUCCESS, source, phase, message, metadata);
  }

  getLogs(filter?: {
    level?: LogLevel;
    source?: string;
    phase?: string;
    since?: number;
  }): LogEntry[] {
    let filtered = this.logs;

    if (filter) {
      if (filter.level) {
        filtered = filtered.filter(l => l.level === filter.level);
      }
      if (filter.source) {
        filtered = filtered.filter(l => l.source === filter.source);
      }
      if (filter.phase) {
        filtered = filtered.filter(l => l.phase === filter.phase);
      }
      if (filter.since !== undefined) {
        filtered = filtered.filter(l => l.timestamp >= filter.since!);
      }
    }

    return filtered;
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  exportLogs(): string {
    return this.logs
      .map(log => {
        const time = new Date(log.timestamp).toISOString();
        const meta = log.metadata ? JSON.stringify(log.metadata) : '';
        return `[${time}] [${log.level}] [${log.source}] [${log.phase}] ${log.message} ${meta}`;
      })
      .join('\n');
  }
}

/**
 * Real-time event emitter for frontend streaming
 */
export type BuildEventType = 
  | 'phase_started'
  | 'phase_completed'
  | 'phase_failed'
  | 'code_generated'
  | 'test_running'
  | 'test_completed'
  | 'build_started'
  | 'build_completed'
  | 'deployment_started'
  | 'deployment_completed'
  | 'log_entry';

export interface BuildEvent {
  type: BuildEventType;
  timestamp: number;
  data: any;
}

export type BuildEventHandler = (event: BuildEvent) => void;

export class BuildEventEmitter {
  private handlers: Map<BuildEventType, BuildEventHandler[]> = new Map();

  on(eventType: BuildEventType, handler: BuildEventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  off(eventType: BuildEventType, handler: BuildEventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(eventType, handlers);
    }
  }

  emit(eventType: BuildEventType, data: any): void {
    const event: BuildEvent = {
      type: eventType,
      timestamp: Date.now(),
      data
    };

    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}
