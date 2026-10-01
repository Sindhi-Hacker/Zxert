import React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Base surface card: layered background, hairline border, soft shadow.
 */
export function Card({ className = '', children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      {...rest}
      className={`bg-surface border border-line rounded-3xl shadow-card dark:shadow-dark-card ${className}`}
    >
      {children}
    </View>
  );
}

/** Inset card group (iOS-style grouped list container). */
export function CardGroup({ className = '', children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      {...rest}
      className={`bg-surface border border-line rounded-3xl overflow-hidden shadow-card dark:shadow-dark-card ${className}`}
    >
      {children}
    </View>
  );
}
