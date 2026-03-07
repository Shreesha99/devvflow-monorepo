export function extractTaskNumber(message: string): number | null {
  const match = message.match(/(?:TASK-|#)(\d+)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}
