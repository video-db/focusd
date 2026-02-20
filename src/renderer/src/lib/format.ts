import type { TimeFormat } from '../../../shared/types';

export function formatDuration(totalSecs: number): string {
  if (totalSecs < 60) return `${totalSecs}s`;
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatTime(epoch: number, format: TimeFormat): string {
  const date = new Date(epoch * 1000);
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatTimeRange(start: number, end: number, format: TimeFormat): string {
  return `${formatTime(start, format)} – ${formatTime(end, format)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export const categoryColors: Record<string, string> = {
  development: '#7BA6C2',
  communication: '#9E88B8',
  browsing: '#6CAAA4',
  documents: '#D8A86A',
  design: '#CC8BA5',
  email: '#8E93C7',
  entertainment: '#CC7878',
  idle: '#B3ADA5',
  other: '#9E9890',
};

export function categoryColor(category: string): string {
  return categoryColors[category] || categoryColors.other;
}

export const productivityColors: Record<string, string> = {
  productive: '#7AB88F',
  neutral: '#D8A86A',
  distracted: '#CC7878',
};

export function productivityColor(label: string): string {
  return productivityColors[label] || productivityColors.neutral;
}

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function percentOf(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
