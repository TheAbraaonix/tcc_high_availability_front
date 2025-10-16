import type { MetricsData, AggregatedMetrics } from '../types/metrics';
import type { CloudProviderType } from '../types/CloudProvider';

export function calculateAggregatedMetrics(
  data: MetricsData[],
  provider?: CloudProviderType
): AggregatedMetrics[] {
  // Filter out pending requests and optionally filter by provider
  const filteredData = data.filter((d) => {
    const isPendingFilter = !d.isPending;
    const providerFilter = provider ? d.provider === provider : true;
    return isPendingFilter && providerFilter;
  });

  const groupedByProvider = filteredData.reduce((acc, metric) => {
    if (!acc[metric.provider]) {
      acc[metric.provider] = [];
    }
    acc[metric.provider].push(metric);
    return acc;
  }, {} as Record<CloudProviderType, MetricsData[]>);

  return Object.entries(groupedByProvider).map(([provider, metrics]) => {
    const responseTimes = metrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const successfulRequests = metrics.filter((m) => m.success).length;
    const failedRequests = metrics.filter((m) => !m.success).length;

    const average =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median =
      responseTimes.length % 2 === 0
        ? (responseTimes[responseTimes.length / 2 - 1] +
            responseTimes[responseTimes.length / 2]) /
          2
        : responseTimes[Math.floor(responseTimes.length / 2)];

    const variance =
      responseTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) /
      responseTimes.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      provider: provider as CloudProviderType,
      totalRequests: metrics.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: average,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      medianResponseTime: median,
      standardDeviation,
    };
  });
}

export function exportToCSV(data: MetricsData[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    'Timestamp',
    'Provider',
    'Image URL',
    'Caption',
    'Response Time (ms)',
    'Status Code',
    'Success',
    'Error',
  ];

  const rows = data.map((metric) => [
    metric.id,
    metric.timestamp.toISOString(),
    metric.provider,
    metric.imageUrl,
    `"${metric.caption.replace(/"/g, '""')}"`,
    metric.responseTime.toFixed(2),
    metric.statusCode,
    metric.success ? 'Yes' : 'No',
    metric.error ? `"${metric.error.replace(/"/g, '""')}"` : '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function exportToJSON(data: MetricsData[]): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
