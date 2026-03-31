export function formatIsoDate(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toISOString().slice(0, 10);
}

export function hoursBetween(olderIso: string, newerIso: string) {
  const older = new Date(olderIso).getTime();
  const newer = new Date(newerIso).getTime();
  return Math.max(0, Math.round((newer - older) / 36e5));
}
