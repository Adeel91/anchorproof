let agentRunning = false;
let lastRun: string | null = null;

export function setAgentRunning(status: boolean) {
  agentRunning = status;
  if (status) {
    lastRun = new Date().toISOString();
  }
}

export function getAgentStatus() {
  return {
    running: agentRunning,
    lastRun: lastRun,
  };
}

export function updateLastRun() {
  lastRun = new Date().toISOString();
}
