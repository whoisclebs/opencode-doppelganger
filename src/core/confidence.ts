export const confidence = {
  confirmed: '🟢 CONFIRMADO',
  inferred: '🟡 INFERIDO',
  gap: '🔴 LACUNA',
} as const;

export type Confidence = keyof typeof confidence;

export function mark(level: Confidence, text: string): string {
  return `${confidence[level]} — ${text}`;
}
