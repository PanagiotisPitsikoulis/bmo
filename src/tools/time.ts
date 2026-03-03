export function getTime(): string {
  const now = new Date();
  return `The current time is ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}.`;
}
