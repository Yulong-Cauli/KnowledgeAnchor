// Shared by the service, browser and isolated regression fixtures.
export function reviewBucket(row, today) {
  if (row.status === 'asserted') {
    if (!row.review_due) return 'unscheduled';
    return row.review_due <= today ? 'today' : 'future';
  }
  if (row.status === 'stale') return 'manual';
  return null;
}

export function reviewCounts(rows, today) {
  const counts = { today: 0, future: 0, unscheduled: 0, asserted: 0, manual: 0 };
  for (const row of rows) {
    const bucket = reviewBucket(row, today);
    if (bucket) counts[bucket] += 1;
    if (row.status === 'asserted') counts.asserted += 1;
  }
  return counts;
}

export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day + days);
  return date.toISOString().slice(0, 10);
}
