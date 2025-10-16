import type { CloudProviderType } from './CloudProvider';

export interface MetricsData {
  id: string;
  timestamp: Date;
  responseTimestamp?: Date;
  provider: CloudProviderType;
  imageUrl: string;
  caption: string;
  responseTime: number;
  statusCode: number;
  success: boolean;
  error?: string;
  isPending?: boolean;
}

export interface AggregatedMetrics {
  provider: CloudProviderType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  medianResponseTime: number;
  standardDeviation: number;
}
