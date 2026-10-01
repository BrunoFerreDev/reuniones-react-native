import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'gray' | 'dark' | 'outline';
  size?: 'sm' | 'md';
  rounded?: 'full' | 'md' | 'lg';
  dot?: boolean;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'gray',
  size = 'sm',
  rounded = 'full',
  dot = false,
  style,
}: BadgeProps) {
  const getStyleConfig = () => {
    switch (variant) {
      case 'green':
        return {
          containerClass: 'bg-emerald-50 border-emerald-300',
          textClass: 'text-emerald-800',
          dotClass: 'bg-emerald-600',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          color: '#065f46',
          dotColor: '#059669',
        };
      case 'red':
        return {
          containerClass: 'bg-rose-50 border-rose-300',
          textClass: 'text-rose-800',
          dotClass: 'bg-rose-600',
          bg: '#fef2f2',
          border: '#fecaca',
          color: '#9f1239',
          dotColor: '#e11d48',
        };
      case 'amber':
        return {
          containerClass: 'bg-amber-50 border-amber-300',
          textClass: 'text-amber-800',
          dotClass: 'bg-amber-600',
          bg: '#fffbeb',
          border: '#fde68a',
          color: '#92400e',
          dotColor: '#d97706',
        };
      case 'blue':
        return {
          containerClass: 'bg-sky-50 border-sky-300',
          textClass: 'text-sky-800',
          dotClass: 'bg-sky-600',
          bg: '#f0f9ff',
          border: '#bae6fd',
          color: '#0369a1',
          dotColor: '#0284c7',
        };
      case 'purple':
        return {
          containerClass: 'bg-purple-50 border-purple-300',
          textClass: 'text-purple-800',
          dotClass: 'bg-purple-600',
          bg: '#faf5ff',
          border: '#e9d5ff',
          color: '#6b21a8',
          dotColor: '#9333ea',
        };
      case 'dark':
        return {
          containerClass: 'bg-slate-900 border-slate-900',
          textClass: 'text-white',
          dotClass: 'bg-white',
          bg: '#0f172a',
          border: '#0f172a',
          color: '#ffffff',
          dotColor: '#ffffff',
        };
      case 'outline':
        return {
          containerClass: 'bg-white border-slate-200',
          textClass: 'text-slate-700',
          dotClass: 'bg-slate-500',
          bg: '#ffffff',
          border: '#e2e8f0',
          color: '#334155',
          dotColor: '#64748b',
        };
      case 'gray':
      default:
        return {
          containerClass: 'bg-slate-100 border-slate-200',
          textClass: 'text-slate-700',
          dotClass: 'bg-slate-500',
          bg: '#f1f5f9',
          border: '#e2e8f0',
          color: '#334155',
          dotColor: '#64748b',
        };
    }
  };

  const cfg = getStyleConfig();
  const borderRadius = rounded === 'md' ? 8 : rounded === 'lg' ? 12 : 9999;
  const paddingH = size === 'sm' ? 8 : 10;
  const paddingV = size === 'sm' ? 2 : 4;
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          borderRadius,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
        style,
      ]}
      className={`self-start flex-row items-center border ${cfg.containerClass}`}>
      {dot && (
        <View
          style={[styles.dot, { backgroundColor: cfg.dotColor }]}
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cfg.dotClass}`}
        />
      )}
      <Text
        style={[styles.text, { color: cfg.color, fontSize }]}
        className={`font-semibold ${cfg.textClass}`}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
  },
});
