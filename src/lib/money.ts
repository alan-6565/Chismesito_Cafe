export function toCents(price: string): number {
  return Math.round(parseFloat(price.replace("$", "")) * 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
