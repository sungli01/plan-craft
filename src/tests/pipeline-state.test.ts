/**
 * Unit Tests for Pipeline State Manager
 * Target: 95%+ Test Coverage
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  PipelineStateManager,
  QualityGateValidator,
  PhaseStatus,
  PhaseGate,
  PhaseMetrics
} from '../core/pipeline-state';

describe('PipelineStateManager', () => {
  let manager: PipelineStateManager;

  beforeEach(() => {
    manager = new PipelineStateManager(
      'test-project-1',
      'Test Project',
      'Build a todo app'
    );
  });

  describe('Initialization', () => {
    it('should initialize with correct project details', () => {
      const state = manager.getState();
      expect(state.projectId).toBe('test-project-1');
      expect(state.projectName).toBe('Test Project');
      expect(state.userIdea).toBe('Build a todo app');
      expect(state.currentPhase).toBe(PhaseGate.G1_CORE_LOGIC);
    });

    it('should initialize all 10 phases with PENDING status', () => {
      const state = manager.getState();
      expect(state.phases.size).toBe(10);
      
      state.phases.forEach((phase) => {
        expect(phase.status).toBe(PhaseStatus.PENDING);
        expect(phase.metrics.testCoverage).toBe(0);
        expect(phase.metrics.buildSuccessRate).toBe(0);
      });
    });
  });

  describe('Phase Management', () => {
    it('should start a phase and update status to CODING', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      const phase = manager.getCurrentPhase();
      
      expect(phase.status).toBe(PhaseStatus.CODING);
      expect(phase.startedAt).toBeDefined();
    });

    it('should update phase metrics', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        testCoverage: 95,
        buildSuccessRate: 100
      });

      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      expect(phase?.metrics.testCoverage).toBe(95);
      expect(phase?.metrics.buildSuccessRate).toBe(100);
    });

    it('should add error logs to phase', () => {
      manager.addPhaseError(PhaseGate.G1_CORE_LOGIC, 'Syntax error at line 42');
      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      
      expect(phase?.errorLog).toContain('Syntax error at line 42');
      expect(phase?.status).toBe(PhaseStatus.BUILD_FAIL);
    });

    it('should add artifacts to phase', () => {
      manager.addPhaseArtifact(PhaseGate.G1_CORE_LOGIC, '/src/core/pipeline.ts');
      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      
      expect(phase?.artifacts).toContain('/src/core/pipeline.ts');
    });

    it('should complete phase when quality gates pass', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        testCoverage: 95,
        buildSuccessRate: 100,
        securityIssues: 0
      });

      const result = manager.completePhase(PhaseGate.G1_CORE_LOGIC);
      expect(result).toBe(true);

      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      expect(phase?.status).toBe(PhaseStatus.COMPLETED);
      expect(phase?.completedAt).toBeDefined();
    });

    it('should reject phase when build fails', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        buildSuccessRate: 80 // Not 100%
      });

      const result = manager.completePhase(PhaseGate.G1_CORE_LOGIC);
      expect(result).toBe(false);

      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      expect(phase?.status).toBe(PhaseStatus.REJECTED);
    });

    it('should reject G2 when build fails', () => {
      manager.startPhase(PhaseGate.G2_API_SERVER);
      manager.updatePhaseMetrics(PhaseGate.G2_API_SERVER, {
        buildSuccessRate: 99
      });

      const result = manager.completePhase(PhaseGate.G2_API_SERVER);
      expect(result).toBe(false);
    });

    it('should reject G3 when build fails', () => {
      manager.startPhase(PhaseGate.G3_UI_COMPONENTS);
      manager.updatePhaseMetrics(PhaseGate.G3_UI_COMPONENTS, {
        buildSuccessRate: 0
      });

      const result = manager.completePhase(PhaseGate.G3_UI_COMPONENTS);
      expect(result).toBe(false);
    });

    it('should reject G4 when build fails', () => {
      manager.startPhase(PhaseGate.G4_INTEGRATION);
      manager.updatePhaseMetrics(PhaseGate.G4_INTEGRATION, {
        buildSuccessRate: 50
      });

      const result = manager.completePhase(PhaseGate.G4_INTEGRATION);
      expect(result).toBe(false);
    });

    it('should pass non-build phases without build check', () => {
      manager.startPhase(PhaseGate.G9_DOCUMENTATION);
      manager.updatePhaseMetrics(PhaseGate.G9_DOCUMENTATION, {
        buildSuccessRate: 0, // Not required for G9
        testCoverage: 0,
        securityIssues: 0
      });

      const result = manager.completePhase(PhaseGate.G9_DOCUMENTATION);
      expect(result).toBe(true);
    });

    it('should move to next phase after completion', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        testCoverage: 95,
        buildSuccessRate: 100,
        securityIssues: 0
      });
      manager.completePhase(PhaseGate.G1_CORE_LOGIC);

      const state = manager.getState();
      expect(state.currentPhase).toBe(PhaseGate.G2_API_SERVER);
    });

    it('should calculate execution time for completed phases', () => {
      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        testCoverage: 95,
        buildSuccessRate: 100,
        securityIssues: 0
      });
      manager.completePhase(PhaseGate.G1_CORE_LOGIC);

      const phase = manager.getPhaseByGate(PhaseGate.G1_CORE_LOGIC);
      expect(phase?.metrics.executionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Project Progress', () => {
    it('should calculate project progress correctly', () => {
      expect(manager.getProjectProgress()).toBe(0);

      manager.startPhase(PhaseGate.G1_CORE_LOGIC);
      manager.updatePhaseMetrics(PhaseGate.G1_CORE_LOGIC, {
        testCoverage: 95,
        buildSuccessRate: 100
      });
      manager.completePhase(PhaseGate.G1_CORE_LOGIC);

      expect(manager.getProjectProgress()).toBe(10); // 1/10 phases
    });

    it('should detect project completion', () => {
      expect(manager.isProjectCompleted()).toBe(false);

      // Complete all phases
      Object.values(PhaseGate).forEach((gate) => {
        manager.startPhase(gate);
        manager.updatePhaseMetrics(gate, {
          testCoverage: 95,
          buildSuccessRate: 100,
          securityIssues: 0
        });
        manager.completePhase(gate);
      });

      expect(manager.isProjectCompleted()).toBe(true);
    });
  });

  describe('Tech Stack Management', () => {
    it('should set and update tech stack', () => {
      manager.setTechStack(['Hono', 'TypeScript', 'Cloudflare']);
      const state = manager.getState();
      
      expect(state.techStack).toEqual(['Hono', 'TypeScript', 'Cloudflare']);
    });
  });
});

describe('QualityGateValidator', () => {
  describe('Build Validation', () => {
    it('should pass when build success rate is 100%', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 100,
        testCoverage: 0,
        securityIssues: 0,
        executionTime: 0
      };
      expect(QualityGateValidator.validateBuild(metrics)).toBe(true);
    });

    it('should fail when build success rate is less than 100%', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 99,
        testCoverage: 0,
        securityIssues: 0,
        executionTime: 0
      };
      expect(QualityGateValidator.validateBuild(metrics)).toBe(false);
    });
  });

  describe('Test Coverage Validation', () => {
    it('should pass when coverage is >= 95%', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 0,
        testCoverage: 95,
        securityIssues: 0,
        executionTime: 0
      };
      expect(QualityGateValidator.validateTestCoverage(metrics)).toBe(true);
    });

    it('should fail when coverage is < 95%', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 0,
        testCoverage: 94.9,
        securityIssues: 0,
        executionTime: 0
      };
      expect(QualityGateValidator.validateTestCoverage(metrics)).toBe(false);
    });
  });

  describe('Security Validation', () => {
    it('should pass when no security issues exist', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 0,
        testCoverage: 0,
        securityIssues: 0,
        executionTime: 0
      };
      expect(QualityGateValidator.validateSecurity(metrics)).toBe(true);
    });

    it('should fail when security issues exist', () => {
      const metrics: PhaseMetrics = {
        buildSuccessRate: 0,
        testCoverage: 0,
        securityIssues: 1,
        executionTime: 0
      };
      expect(QualityGateValidator.validateSecurity(metrics)).toBe(false);
    });
  });

  describe('Phase Progression', () => {
    it('should allow G1 to progress with 100% build rate', () => {
      const phase = {
        gate: PhaseGate.G1_CORE_LOGIC,
        status: PhaseStatus.CODING,
        metrics: {
          buildSuccessRate: 100,
          testCoverage: 0,
          securityIssues: 0,
          executionTime: 0
        }
      };
      expect(QualityGateValidator.canProgressToNextPhase(phase)).toBe(true);
    });

    it('should block G5 if test coverage < 95%', () => {
      const phase = {
        gate: PhaseGate.G5_UNIT_TESTS,
        status: PhaseStatus.CODING,
        metrics: {
          buildSuccessRate: 100,
          testCoverage: 94,
          securityIssues: 0,
          executionTime: 0
        }
      };
      expect(QualityGateValidator.canProgressToNextPhase(phase)).toBe(false);
    });

    it('should block G6 if security issues exist', () => {
      const phase = {
        gate: PhaseGate.G6_SECURITY_SCAN,
        status: PhaseStatus.CODING,
        metrics: {
          buildSuccessRate: 100,
          testCoverage: 95,
          securityIssues: 1,
          executionTime: 0
        }
      };
      expect(QualityGateValidator.canProgressToNextPhase(phase)).toBe(false);
    });
  });
});
