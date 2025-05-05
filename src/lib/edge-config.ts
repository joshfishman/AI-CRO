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

// Create a mock Edge Config for local development
const mockEdgeConfig = {
  async get(key: string) {
    console.log(`[Mock Edge Config] Getting key: ${key}`);
    const mockData: Record<string, any> = {
      users: {},
      tests: {},
      segments: {},
      settings: {
        defaultTheme: 'light',
        apiKeys: {},
        features: {
          advancedTargeting: true,
          analytics: true,
          bookmarklet: true
        }
      }
    };
    return mockData[key];
  },
  async set(key: string, value: any) {
    console.log(`[Mock Edge Config] Setting key: ${key}`, value);
    return true;
  },
  async has(key: string) {
    console.log(`[Mock Edge Config] Checking key: ${key}`);
    return ['users', 'tests', 'segments', 'settings'].includes(key);
  }
};

// Create a custom type that includes both get and set methods
type EdgeConfigClientWithSet = {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<boolean>;
  has: (key: string) => Promise<boolean>;
};

// Create the Edge Config client with fallback to mock
const edgeConfig = process.env.EDGE_CONFIG 
  ? createClient(process.env.EDGE_CONFIG) as unknown as EdgeConfigClientWithSet
  : mockEdgeConfig;

// Helper functions for common operations
export async function getUserConfig(userId: string): Promise<UserConfig | null> {
  try {
    const users = await edgeConfig.get('users') || {};
    return users[userId] ?? null;
  } catch (error) {
    console.error('Error getting user config:', error);
    return null;
  }
}

export async function getTestConfig(testId: string): Promise<TestConfig | null> {
  try {
    const tests = await edgeConfig.get('tests') || {};
    return tests[testId] ?? null;
  } catch (error) {
    console.error('Error getting test config:', error);
    return null;
  }
}

export async function getSegmentConfig(segmentId: string): Promise<SegmentConfig | null> {
  try {
    const segments = await edgeConfig.get('segments') || {};
    return segments[segmentId] ?? null;
  } catch (error) {
    console.error('Error getting segment config:', error);
    return null;
  }
}

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    const settings = await edgeConfig.get('settings') || null;
    return settings;
  } catch (error) {
    console.error('Error getting global settings:', error);
    return null;
  }
}

// Update functions
export async function updateUserConfig(userId: string, data: Partial<UserConfig>): Promise<void> {
  try {
    const users = await edgeConfig.get<Record<string, UserConfig>>('users') ?? {};
    users[userId] = { ...users[userId], ...data };
    await edgeConfig.set('users', users);
  } catch (error) {
    console.error('Error updating user config:', error);
  }
}

export async function updateTestConfig(testId: string, data: Partial<TestConfig>): Promise<void> {
  try {
    const tests = await edgeConfig.get<Record<string, TestConfig>>('tests') ?? {};
    tests[testId] = { ...tests[testId], ...data };
    await edgeConfig.set('tests', tests);
  } catch (error) {
    console.error('Error updating test config:', error);
  }
}

export async function updateSegmentConfig(segmentId: string, data: Partial<SegmentConfig>): Promise<void> {
  try {
    const segments = await edgeConfig.get<Record<string, SegmentConfig>>('segments') ?? {};
    segments[segmentId] = { ...segments[segmentId], ...data };
    await edgeConfig.set('segments', segments);
  } catch (error) {
    console.error('Error updating segment config:', error);
  }
}

export async function updateGlobalSettings(data: Partial<GlobalSettings>): Promise<void> {
  try {
    const settings = await edgeConfig.get<GlobalSettings>('settings') ?? {};
    await edgeConfig.set('settings', { ...settings, ...data });
  } catch (error) {
    console.error('Error updating global settings:', error);
  }
} 