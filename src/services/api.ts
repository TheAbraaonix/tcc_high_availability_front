import type { MetricsData } from '../types/metrics';
import type { ApiEndpoints } from '../types/api';
import type { CloudProviderType } from '../types/CloudProvider';

export interface CaptionResponse {
  caption: string;
}

export async function generateCaption(
  imageUrl: string,
  provider: CloudProviderType,
  apiEndpoints: ApiEndpoints
): Promise<MetricsData> {
  const startTime = performance.now();
  const endpoint = apiEndpoints[provider];

  try {
    const response = await fetch(`${endpoint}/caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const responseTimestamp = new Date();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        responseTimestamp,
        provider,
        imageUrl,
        caption: '',
        responseTime,
        statusCode: response.status,
        success: false,
        error: errorData.detail || `HTTP ${response.status}`,
      };
    }

    const data: CaptionResponse = await response.json();

    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      responseTimestamp,
      provider,
      imageUrl,
      caption: data.caption,
      responseTime,
      statusCode: response.status,
      success: true,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const responseTimestamp = new Date();

    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      responseTimestamp,
      provider,
      imageUrl,
      caption: '',
      responseTime,
      statusCode: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function checkHealth(provider: CloudProviderType, apiEndpoints: ApiEndpoints): Promise<boolean> {
  const endpoint = apiEndpoints[provider];

  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch {
    return false;
  }
}
