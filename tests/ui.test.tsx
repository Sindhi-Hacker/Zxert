/**
 * UI regression tests.
 *
 * These render real components through NativeWind's test harness using the
 * project's actual tailwind.config.js + global.css, so a broken NativeWind
 * pipeline (missing preset, bad content globs, invalid tokens) fails here
 * instead of shipping an unstyled app.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { View } from 'react-native';
import { render, screen } from 'nativewind/test';

import { Button } from '@/components/ui/Button';
import { Brand } from '@/components/ui/Brand';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { MessageItem } from '@/components/chat/MessageItem';
import type { ChatMessage } from '@/types/chat';

const config = require('../tailwind.config.js');
const css = readFileSync(join(__dirname, '..', 'global.css'), 'utf8');

const options = { config, css } as never;

describe('design system renders with compiled styles', () => {
  it('Brand renders the gradient mark and wordmark', async () => {
    await render(
      <View>
        <Brand />
      </View>,
      options,
    );
    expect(screen.getByText('Z')).toBeTruthy();
    expect(screen.getByText('Zxert')).toBeTruthy();
  });

  it('Button mounts with its accessibility label', async () => {
    await render(<Button label="Save provider" />, options);
    expect(screen.getByLabelText('Save provider')).toBeTruthy();
  });

  it('semantic action tokens resolve through the production config', async () => {
    await render(
      <View>
        <View testID="btn" className="bg-btn" />
        <View testID="bubble" className="bg-bubble" />
        <View testID="accent" className="bg-accent-soft" />
      </View>,
      options,
    );
    const probe = (id: string) => JSON.stringify(screen.getByTestId(id, { hidden: true }).props.style);
    expect(probe('btn')).toContain('#171c12');
    expect(probe('bubble')).toContain('#e4efd2');
    expect(probe('accent')).toContain('#e7f3d6');
  });

  it('dark mode flips the canvas token', async () => {
    await render(
      <View className="dark">
        <View testID="bg" className="bg-canvas" />
      </View>,
      options,
    );
    const bg = screen.getByTestId('bg', { hidden: true });
    expect(JSON.stringify(bg.props.style)).toContain('#0b0d09');
  });

  it('SegmentedControl renders all segments', async () => {
    await render(
      <SegmentedControl
        items={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        value="system"
        onChange={() => {}}
      />,
      options,
    );
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
  });

  it('user MessageItem renders its text in a bubble', async () => {
    const message: ChatMessage = {
      id: 'msg_1',
      conversationId: 'conv_1',
      role: 'user',
      blocks: [{ type: 'text', text: 'Hello Zxert' }],
      status: 'complete',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await render(<MessageItem message={message} />, options);
    expect(screen.getByText('Hello Zxert')).toBeTruthy();
  });
});
