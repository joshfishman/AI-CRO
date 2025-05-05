import { createClient } from '@vercel/edge-config';

// Types for our Edge Config data
export interface UserConfig {
  id: string;
  role: 'user' | 'admin';
  settings: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    apiKey?: string;
  };
}

export interface TestConfig {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    content: string;
    weight?: number;
  }[];
  targeting: {
    segments: string[];
    rules: {
      type: 'url' | 'device' | 'custom';
      condition: string;
      value: string;
    }[];
  };
  metrics: {
    impressions: number;
    conversions: number;
    startDate: string;
    endDate?: string;
  };
}

export interface SegmentConfig {
  id: string;
  name: string;
  description?: string;
  rules: {
    type: 'url' | 'device' | 'custom';
    condition: string;
    value: string;
  }[];
  users: string[];
}

export interface GlobalSettings {
  defaultTheme: 'light' | 'dark';
  apiKeys: {
    [key: string]: string;
  };
  features: {
    [key: string]: boolean;
  };
}

export interface EdgeConfigData {
  users: Record<string, UserConfig>;
  tests: Record<string, TestConfig>;
  segments: Record<string, SegmentConfig>;
  settings: GlobalSettings;
}

// Create the Edge Config client
const edgeConfig = createClient(process.env.EDGE_CONFIG);

// Helper functions for common operations
export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  const users = await edgeConfig.get<Record<string, UserConfig>>('users');
  return users?.[userId] ?? null;
}

export async function getTestConfig(testId: string): Promise<TestConfig | null> {
  const tests = await edgeConfig.get<Record<string, TestConfig>>('tests');
  return tests?.[testId] ?? null;
}

export async function getSegmentConfig(segmentId: string): Promise<SegmentConfig | null> {
  const segments = await edgeConfig.get<Record<string, SegmentConfig>>('segments');
  return segments?.[segmentId] ?? null;
}

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const settings = await edgeConfig.get<GlobalSettings>('settings');
  return settings ?? null;
}

// Update functions
export async function updateUserConfig(userId: string, data: Partial<UserConfig>): Promise<void> {
  const users = await edgeConfig.get<Record<string, UserConfig>>('users') ?? {};
  users[userId] = { ...users[userId], ...data };
  await edgeConfig.set('users', users);
}

export async function updateTestConfig(testId: string, data: Partial<TestConfig>): Promise<void> {
  const tests = await edgeConfig.get<Record<string, TestConfig>>('tests') ?? {};
  tests[testId] = { ...tests[testId], ...data };
  await edgeConfig.set('tests', tests);
}

export async function updateSegmentConfig(segmentId: string, data: Partial<SegmentConfig>): Promise<void> {
  const segments = await edgeConfig.get<Record<string, SegmentConfig>>('segments') ?? {};
  segments[segmentId] = { ...segments[segmentId], ...data };
  await edgeConfig.set('segments', segments);
}

export async function updateGlobalSettings(data: Partial<GlobalSettings>): Promise<void> {
  const settings = await edgeConfig.get<GlobalSettings>('settings') ?? {};
  await edgeConfig.set('settings', { ...settings, ...data });
} 