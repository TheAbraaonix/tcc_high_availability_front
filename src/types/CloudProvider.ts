export const CloudProvider = {
  AWS: 'aws',
  AZURE: 'azure',
} as const;

export type CloudProviderType = typeof CloudProvider[keyof typeof CloudProvider];
