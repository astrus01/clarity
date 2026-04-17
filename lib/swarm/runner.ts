import { createAgentGraph, type AgentState } from "./graph";

// Buffer to store agent state per session
type Buffer<T> = {
  data: T | null;
  logs: string[];
  artifacts: Array<{ type: string; title: string; content: any }>;
  status: string;
};

const buffers: Map<string, Buffer<AgentState>> = new Map();

export function getBuffer(sessionId: string) {
  if (!buffers.has(sessionId)) {
    buffers.set(sessionId, {
      data: null,
      logs: [],
      artifacts: [],
      status: "idle",
    });
  }
  return buffers.get(sessionId)!;
}

// Starts the swarm and returns a promise that resolves when complete
export function startSwarm(sessionId: string, query: string) {
  const buffer = getBuffer(sessionId);
  buffer.status = "running";
  buffer.logs = [...buffer.logs, `[Swarm] Started with query: ${query}`];

  // Create initial state
  const initialState: AgentState = {
    messages: [{ role: "user", content: query }],
    next: "planner",
    artifacts: [],
  };

  // Run the graph (async)
  const graph = createAgentGraph();

  const executionPromise = (async () => {
    try {
      let state = initialState;
      // Execute each step manually since we're using a simple graph
      state = await planner(state);
      buffer.logs.push("[Planner] Plan created");

      state = await executor(state);
      buffer.logs.push("[Executor] Tools executed");

      state = await uiGenerator(state);
      buffer.logs.push("[UI Generator] Spec generated");

      buffer.data = state;
      buffer.status = "completed";
    } catch (error) {
      buffer.status = "error";
      buffer.logs.push(`[Swarm] Error: ${error}`);
      throw error;
    }
  })();

  return {
    buffer,
    executionPromise,
  };
}

// Stub tool functions (these will be implemented)
export async function exaSearch(query: string) {
  // TODO: Implement with Exa.js SDK
  return { results: [] };
}

export async function stagehandBrowse(url: string, actions: any[]) {
  // TODO: Implement with Stagehand
  return { screenshots: [], data: {} };
}

export async function gmailRead(query: string) {
  // TODO: Implement Gmail API
  return { threads: [] };
}

export async function calendarCheck(query: string) {
  // TODO: Implement Calendar API
  return { events: [] };
}
