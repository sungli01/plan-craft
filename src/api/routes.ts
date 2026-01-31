import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PipelineStateManager, PhaseGate, PhaseStatus } from '../core/pipeline-state';
import { BuildLogger, LogLevel } from '../core/build-logger';
import { AgentMessageQueue, AgentRole, MessageType } from '../core/agent-protocol';

// In-memory storage (will be replaced with D1 in production)
const projects = new Map<string, PipelineStateManager>();
const logger = new BuildLogger();
const messageQueue = new AgentMessageQueue();

const api = new Hono();

// Enable CORS
api.use('/*', cors());

/**
 * POST /api/projects
 * Create new project from user idea
 */
api.post('/projects', async (c) => {
  const { projectName, userIdea } = await c.req.json();

  if (!projectName || !userIdea) {
    return c.json({ error: 'projectName and userIdea are required' }, 400);
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const manager = new PipelineStateManager(projectId, projectName, userIdea);

  projects.set(projectId, manager);

  logger.info('tech-lead', 'G1', `New project created: ${projectName}`, { projectId });

  // Tech Lead assigns task to Dev Agent
  messageQueue.send({
    from: AgentRole.TECH_LEAD,
    to: AgentRole.DEV,
    type: MessageType.TASK_ASSIGNMENT,
    payload: {
      taskId: `task_${projectId}_g1`,
      phase: 'G1_CORE_LOGIC',
      description: 'Implement core application logic',
      requirements: [
        'Define data models',
        'Implement business logic',
        'Create database schema'
      ]
    },
    projectId
  });

  return c.json({
    projectId,
    projectName,
    userIdea,
    currentPhase: PhaseGate.G1_CORE_LOGIC,
    status: PhaseStatus.PENDING,
    createdAt: manager.getState().createdAt
  }, 201);
});

/**
 * GET /api/projects/:projectId
 * Get project details and current status
 */
api.get('/projects/:projectId', async (c) => {
  const projectId = c.req.param('projectId');
  const manager = projects.get(projectId);

  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const state = manager.getState();
  const currentPhase = manager.getCurrentPhase();
  const progress = manager.getProjectProgress();

  return c.json({
    projectId: state.projectId,
    projectName: state.projectName,
    userIdea: state.userIdea,
    techStack: state.techStack,
    currentPhase: state.currentPhase,
    currentPhaseStatus: currentPhase.status,
    progress,
    isCompleted: manager.isProjectCompleted(),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt
  });
});

/**
 * GET /api/projects/:projectId/phases
 * Get all phases with their status
 */
api.get('/projects/:projectId/phases', async (c) => {
  const projectId = c.req.param('projectId');
  const manager = projects.get(projectId);

  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const state = manager.getState();
  const phases = Array.from(state.phases.values()).map(phase => ({
    gate: phase.gate,
    status: phase.status,
    metrics: phase.metrics,
    startedAt: phase.startedAt,
    completedAt: phase.completedAt,
    errorCount: phase.errorLog?.length || 0,
    artifactCount: phase.artifacts?.length || 0
  }));

  return c.json({ phases });
});

/**
 * POST /api/projects/:projectId/phases/:gate/start
 * Start a specific phase
 */
api.post('/projects/:projectId/phases/:gate/start', async (c) => {
  const projectId = c.req.param('projectId');
  const gate = c.req.param('gate') as PhaseGate;
  const manager = projects.get(projectId);

  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  manager.startPhase(gate);
  logger.info('tech-lead', gate, `Phase started: ${gate}`, { projectId });

  const currentPhase = manager.getCurrentPhase();

  return c.json({
    gate: currentPhase.gate,
    status: currentPhase.status,
    startedAt: currentPhase.startedAt
  });
});

/**
 * POST /api/projects/:projectId/phases/:gate/complete
 * Complete a phase (quality gate validation)
 */
api.post('/projects/:projectId/phases/:gate/complete', async (c) => {
  const projectId = c.req.param('projectId');
  const gate = c.req.param('gate') as PhaseGate;
  const manager = projects.get(projectId);

  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const success = manager.completePhase(gate);
  const phase = manager.getPhaseByGate(gate);

  if (success) {
    logger.success('tech-lead', gate, `Phase completed: ${gate}`, {
      projectId,
      metrics: phase?.metrics
    });
  } else {
    logger.error('tech-lead', gate, `Phase rejected: ${gate}`, {
      projectId,
      metrics: phase?.metrics
    });
  }

  return c.json({
    gate,
    success,
    status: phase?.status,
    metrics: phase?.metrics,
    nextPhase: success ? manager.getState().currentPhase : null
  });
});

/**
 * PUT /api/projects/:projectId/phases/:gate/metrics
 * Update phase metrics
 */
api.put('/projects/:projectId/phases/:gate/metrics', async (c) => {
  const projectId = c.req.param('projectId');
  const gate = c.req.param('gate') as PhaseGate;
  const metrics = await c.req.json();
  const manager = projects.get(projectId);

  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  manager.updatePhaseMetrics(gate, metrics);
  logger.debug('tech-lead', gate, `Metrics updated: ${gate}`, { projectId, metrics });

  const phase = manager.getPhaseByGate(gate);

  return c.json({
    gate,
    metrics: phase?.metrics
  });
});

/**
 * GET /api/projects/:projectId/logs
 * Get build logs with optional filtering
 */
api.get('/projects/:projectId/logs', async (c) => {
  const projectId = c.req.param('projectId');
  const level = c.req.query('level') as LogLevel | undefined;
  const source = c.req.query('source');
  const phase = c.req.query('phase');
  const sinceParam = c.req.query('since');
  const limitParam = c.req.query('limit');

  const since = sinceParam ? parseInt(sinceParam, 10) : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  const manager = projects.get(projectId);
  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  let logs = logger.getLogs({ level, source, phase, since });

  // Apply limit
  if (limit) {
    logs = logs.slice(-limit);
  }

  return c.json({ logs, total: logs.length });
});

/**
 * POST /api/projects/:projectId/logs
 * Add a log entry
 */
api.post('/projects/:projectId/logs', async (c) => {
  const projectId = c.req.param('projectId');
  const { level, source, phase, message, metadata } = await c.req.json();

  const manager = projects.get(projectId);
  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const entry = logger.log(level, source, phase, message, metadata);

  return c.json({ entry }, 201);
});

/**
 * GET /api/projects/:projectId/messages
 * Get agent messages
 */
api.get('/projects/:projectId/messages', async (c) => {
  const projectId = c.req.param('projectId');
  const agent = c.req.query('agent') as AgentRole | undefined;

  const manager = projects.get(projectId);
  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const messages = agent
    ? messageQueue.receive(agent)
    : messageQueue.getMessagesByProject(projectId);

  return c.json({ messages, total: messages.length });
});

/**
 * POST /api/projects/:projectId/messages
 * Send agent message
 */
api.post('/projects/:projectId/messages', async (c) => {
  const projectId = c.req.param('projectId');
  const { from, to, type, payload } = await c.req.json();

  const manager = projects.get(projectId);
  if (!manager) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const message = messageQueue.send({
    from,
    to,
    type,
    payload,
    projectId
  });

  logger.debug(from, manager.getState().currentPhase, `Message sent: ${type}`, {
    to,
    messageId: message.id
  });

  return c.json({ message }, 201);
});

/**
 * GET /api/health
 * Health check endpoint
 */
api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    activeProjects: projects.size,
    totalLogs: logger.getRecentLogs(1).length > 0 ? 'active' : 'idle',
    queuedMessages: messageQueue.getMessagesByProject('').length
  });
});

/**
 * GET /api/stats
 * System statistics
 */
api.get('/stats', (c) => {
  const projectList = Array.from(projects.values()).map(manager => {
    const state = manager.getState();
    return {
      projectId: state.projectId,
      projectName: state.projectName,
      currentPhase: state.currentPhase,
      progress: manager.getProjectProgress(),
      isCompleted: manager.isProjectCompleted()
    };
  });

  return c.json({
    totalProjects: projects.size,
    activeProjects: projectList.filter(p => !p.isCompleted).length,
    completedProjects: projectList.filter(p => p.isCompleted).length,
    projects: projectList
  });
});

export default api;
