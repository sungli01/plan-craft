/**
 * Pipeline State Manager
 * Manages the 10-phase development pipeline (G1-G10)
 */

export enum PhaseStatus {
  PENDING = 'PENDING',
  CODING = 'CODING',
  BUILD_PASS = 'BUILD_PASS',
  BUILD_FAIL = 'BUILD_FAIL',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum PhaseGate {
  G1_CORE_LOGIC = 'G1_CORE_LOGIC',
  G2_API_SERVER = 'G2_API_SERVER',
  G3_UI_COMPONENTS = 'G3_UI_COMPONENTS',
  G4_INTEGRATION = 'G4_INTEGRATION',
  G5_UNIT_TESTS = 'G5_UNIT_TESTS',
  G6_SECURITY_SCAN = 'G6_SECURITY_SCAN',
  G7_BUILD_OPTIMIZATION = 'G7_BUILD_OPTIMIZATION',
  G8_DEPLOYMENT = 'G8_DEPLOYMENT',
  G9_DOCUMENTATION = 'G9_DOCUMENTATION',
  G10_HANDOVER = 'G10_HANDOVER'
}

export interface PhaseMetrics {
  testCoverage: number; // 0-100
  buildSuccessRate: number; // 0-100
  securityIssues: number;
  executionTime: number; // milliseconds
}

export interface PhaseState {
  gate: PhaseGate;
  status: PhaseStatus;
  metrics: PhaseMetrics;
  startedAt?: number;
  completedAt?: number;
  errorLog?: string[];
  artifacts?: string[]; // Generated file paths
}

export interface ReferenceDocument {
  id: string;
  type: 'url' | 'file' | 'image';
  url?: string;
  fileName?: string;
  fileSize?: number;
  content?: string;
  uploadedAt: number;
}

export interface ProjectState {
  projectId: string;
  projectName: string;
  userIdea: string;
  techStack: string[];
  currentPhase: PhaseGate;
  phases: Map<PhaseGate, PhaseState>;
  references: ReferenceDocument[]; // NEW: Reference documents
  isPaused: boolean; // NEW: Project pause state
  isCancelled: boolean; // NEW: Project cancellation state
  upgrades: ProjectUpgrade[]; // NEW: Upgrade history
  createdAt: number;
  updatedAt: number;
}

export interface ProjectUpgrade {
  upgradeId: string;
  instruction: string;
  references: ReferenceDocument[];
  timestamp: number;
  completedAt?: number;
}

/**
 * Quality Gate Validator
 * Strict rules for phase progression
 */
export class QualityGateValidator {
  /**
   * REJECT RULE: Build must be 100% successful
   */
  static validateBuild(metrics: PhaseMetrics): boolean {
    return metrics.buildSuccessRate === 100;
  }

  /**
   * REJECT RULE: Test coverage must be >= 95%
   */
  static validateTestCoverage(metrics: PhaseMetrics): boolean {
    return metrics.testCoverage >= 95;
  }

  /**
   * REJECT RULE: No critical security issues allowed
   */
  static validateSecurity(metrics: PhaseMetrics): boolean {
    return metrics.securityIssues === 0;
  }

  /**
   * Main gate check - all rules must pass
   */
  static canProgressToNextPhase(phase: PhaseState): boolean {
    const { metrics } = phase;
    
    // G1-G4: Build must pass
    if ([PhaseGate.G1_CORE_LOGIC, PhaseGate.G2_API_SERVER, PhaseGate.G3_UI_COMPONENTS, PhaseGate.G4_INTEGRATION].includes(phase.gate)) {
      if (!this.validateBuild(metrics)) {
        return false;
      }
    }

    // G5: Test coverage requirement
    if (phase.gate === PhaseGate.G5_UNIT_TESTS) {
      if (!this.validateTestCoverage(metrics)) {
        return false;
      }
    }

    // G6: Security check
    if (phase.gate === PhaseGate.G6_SECURITY_SCAN) {
      if (!this.validateSecurity(metrics)) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Pipeline State Manager
 */
export class PipelineStateManager {
  private state: ProjectState;

  constructor(projectId: string, projectName: string, userIdea: string) {
    this.state = {
      projectId,
      projectName,
      userIdea,
      techStack: [],
      currentPhase: PhaseGate.G1_CORE_LOGIC,
      phases: new Map(),
      references: [], // Initialize references
      isPaused: false,
      isCancelled: false,
      upgrades: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.initializePhases();
  }

  private initializePhases(): void {
    const gates = Object.values(PhaseGate);
    gates.forEach((gate) => {
      this.state.phases.set(gate, {
        gate,
        status: PhaseStatus.PENDING,
        metrics: {
          testCoverage: 0,
          buildSuccessRate: 0,
          securityIssues: 0,
          executionTime: 0
        },
        errorLog: [],
        artifacts: []
      });
    });
  }

  getState(): ProjectState {
    return this.state;
  }

  getCurrentPhase(): PhaseState {
    return this.state.phases.get(this.state.currentPhase)!;
  }

  startPhase(gate: PhaseGate): void {
    const phase = this.state.phases.get(gate);
    if (phase) {
      phase.status = PhaseStatus.CODING;
      phase.startedAt = Date.now();
      this.state.currentPhase = gate;
      this.state.updatedAt = Date.now();
    }
  }

  updatePhaseMetrics(gate: PhaseGate, metrics: Partial<PhaseMetrics>): void {
    const phase = this.state.phases.get(gate);
    if (phase) {
      phase.metrics = { ...phase.metrics, ...metrics };
      this.state.updatedAt = Date.now();
    }
  }

  addPhaseError(gate: PhaseGate, error: string): void {
    const phase = this.state.phases.get(gate);
    if (phase) {
      phase.errorLog = phase.errorLog || [];
      phase.errorLog.push(error);
      phase.status = PhaseStatus.BUILD_FAIL;
      this.state.updatedAt = Date.now();
    }
  }

  addPhaseArtifact(gate: PhaseGate, artifact: string): void {
    const phase = this.state.phases.get(gate);
    if (phase) {
      phase.artifacts = phase.artifacts || [];
      phase.artifacts.push(artifact);
      this.state.updatedAt = Date.now();
    }
  }

  completePhase(gate: PhaseGate): boolean {
    const phase = this.state.phases.get(gate);
    if (!phase) return false;

    // Quality Gate Validation
    if (!QualityGateValidator.canProgressToNextPhase(phase)) {
      phase.status = PhaseStatus.REJECTED;
      return false;
    }

    phase.status = PhaseStatus.COMPLETED;
    phase.completedAt = Date.now();
    phase.metrics.executionTime = phase.completedAt - (phase.startedAt || phase.completedAt);

    // Move to next phase
    const gates = Object.values(PhaseGate);
    const currentIndex = gates.indexOf(gate);
    if (currentIndex < gates.length - 1) {
      this.state.currentPhase = gates[currentIndex + 1];
    }

    this.state.updatedAt = Date.now();
    return true;
  }

  getPhaseByGate(gate: PhaseGate): PhaseState | undefined {
    return this.state.phases.get(gate);
  }

  setTechStack(stack: string[]): void {
    this.state.techStack = stack;
    this.state.updatedAt = Date.now();
  }

  isProjectCompleted(): boolean {
    const g10Phase = this.state.phases.get(PhaseGate.G10_HANDOVER);
    return g10Phase?.status === PhaseStatus.COMPLETED;
  }

  getProjectProgress(): number {
    const phases = Array.from(this.state.phases.values());
    const completedPhases = phases.filter(p => p.status === PhaseStatus.COMPLETED).length;
    return (completedPhases / phases.length) * 100;
  }

  // NEW: Reference document management
  addReference(reference: ReferenceDocument): void {
    this.state.references.push(reference);
    this.state.updatedAt = Date.now();
  }

  getReferences(): ReferenceDocument[] {
    return this.state.references;
  }

  // NEW: Project control methods
  pauseProject(): void {
    this.state.isPaused = true;
    this.state.updatedAt = Date.now();
  }

  resumeProject(): void {
    this.state.isPaused = false;
    this.state.updatedAt = Date.now();
  }

  cancelProject(): void {
    this.state.isCancelled = true;
    this.state.isPaused = true;
    this.state.updatedAt = Date.now();
  }

  isProjectPaused(): boolean {
    return this.state.isPaused;
  }

  isProjectCancelled(): boolean {
    return this.state.isCancelled;
  }

  // NEW: Upgrade management
  addUpgrade(instruction: string, references: ReferenceDocument[]): string {
    const upgradeId = `upgrade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const upgrade: ProjectUpgrade = {
      upgradeId,
      instruction,
      references,
      timestamp: Date.now()
    };
    this.state.upgrades.push(upgrade);
    this.state.updatedAt = Date.now();
    return upgradeId;
  }

  completeUpgrade(upgradeId: string): void {
    const upgrade = this.state.upgrades.find(u => u.upgradeId === upgradeId);
    if (upgrade) {
      upgrade.completedAt = Date.now();
      this.state.updatedAt = Date.now();
    }
  }

  getUpgrades(): ProjectUpgrade[] {
    return this.state.upgrades;
  }
}
