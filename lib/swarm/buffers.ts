export type SwarmBuffer = {
  logs: string[];
  artifacts: Array<{ type: string; title: string; content: any }>;
  status: "idle" | "running" | "completed" | "error";
  updatedAt: Date;
};

const buffers: Map<string, SwarmBuffer> = new Map();

export function getSwarmBuffer(sessionId: string): SwarmBuffer {
  if (!buffers.has(sessionId)) {
    buffers.set(sessionId, {
      logs: [],
      artifacts: [],
      status: "idle",
      updatedAt: new Date(),
    });
  }
  return buffers.get(sessionId)!;
}

export function updateSwarmBuffer(
  sessionId: string,
  updates: Partial<SwarmBuffer>
) {
  const buf = getSwarmBuffer(sessionId);
  buffers.set(sessionId, { ...buf, ...updates, updatedAt: new Date() });
}
