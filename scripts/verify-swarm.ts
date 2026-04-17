import { startSwarm } from "@/lib/swarm/runner";

// Simple verification script to test that swarm can start and complete
// Run: npx tsx scripts/verify-swarm.ts

async function main() {
  const query = "What is the weather in San Francisco?";

  console.log(`[Verify] Starting swarm with query: "${query}"`);

  try {
    const { buffer, executionPromise } = startSwarm("test-session", query);

    console.log("[Verify] Swarm started, waiting for execution...");

    await executionPromise;

    console.log("[Verify] Swarm completed!");
    console.log("[Verify] Final buffer:", {
      status: buffer.status,
      logs: buffer.logs.slice(-5),
      artifacts: buffer.artifacts,
    });
  } catch (error) {
    console.error("[Verify] Swarm failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
