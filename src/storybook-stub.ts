// Stub implementations for Storybook modules
// This file is used to prevent build errors when Storybook files are imported but Storybook is not installed
import React from 'react';

// @storybook/react stubs
export type Meta<T = React.ComponentType<any>> = {
  title: string;
  component: T;
  parameters?: unknown;
  tags?: string[];
  argTypes?: unknown;
};

export type StoryObj<T = React.ComponentType<any>> = {
  args?: Partial<T extends React.ComponentType<infer P> ? P : never>;
  render?: (args: any) => React.ReactNode;
};

// @storybook/addon-actions stubs
export const action = (name: string) => () => {
  console.log(`Action: ${name}`);
}; 