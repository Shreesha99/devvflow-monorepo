export function extractTaskId(message: string): number | null {
  const match = message.match(/\(#(\d+)\)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}
