export function extractTaskNumber(message: string): number | null {
  const match = message.match(/(?:TASK[-\s]?|#)(\d+)/i);
  if (!match) return null;
  return Number(match[1]);
}
