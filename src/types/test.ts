import type { CloudProviderType } from './CloudProvider';

export interface TestConfiguration {
  imageUrl: string;
  provider: CloudProviderType;
  cpuConfig: string;
  ramConfig: string;
  iterations: number;
}
