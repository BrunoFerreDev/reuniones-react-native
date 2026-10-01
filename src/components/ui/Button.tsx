import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  PressableProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'success' | 'outline' | 'subtle-green' | 'subtle-red' | 'subtle-amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  style?: ViewStyle | ((state: { pressed: boolean }) => ViewStyle);
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  // Pure style fallbacks to ensure 100% styling reliability
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
      case 'success':
        return { backgroundColor: '#059669', borderColor: '#059669' };
      case 'dark':
        return { backgroundColor: '#0f172a', borderColor: '#0f172a' };
      case 'secondary':
        return { backgroundColor: '#334155', borderColor: '#334155' };
      case 'danger':
        return { backgroundColor: '#e11d48', borderColor: '#e11d48' };
      case 'subtle-green':
        return { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 };
      case 'subtle-red':
        return { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 };
      case 'subtle-amber':
        return { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1 };
      case 'outline':
      default:
        return { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1 };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 10, paddingVertical: 6 };
      case 'lg':
        return { paddingHorizontal: 20, paddingVertical: 12 };
      case 'md':
      default:
        return { paddingHorizontal: 14, paddingVertical: 8 };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
        return '#334155';
      case 'subtle-green':
        return '#065f46';
      case 'subtle-red':
        return '#9f1239';
      case 'subtle-amber':
        return '#92400e';
      default:
        return '#ffffff';
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 11 };
      case 'lg':
        return { fontSize: 15 };
      case 'md':
      default:
        return { fontSize: 13 };
    }
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      className={`flex-row items-center justify-center rounded-xl font-semibold transition-all ${className}`}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#059669' : '#ffffff'}
        />
      ) : (
        <>
          {icon ? <Text style={[styles.icon, { color: getTextColor() }]}>{icon}</Text> : null}
          <Text
            style={[
              styles.text,
              getTextSize(),
              { color: getTextColor() },
            ]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: '700',
  },
  icon: {
    marginRight: 6,
    fontSize: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
