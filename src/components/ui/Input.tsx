import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  containerClassName = '',
  className = '',
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container} className={`w-full ${containerClassName}`}>
      {label ? (
        <Text style={styles.label} className="mb-1 text-sm font-medium text-slate-700">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error ? (
        <Text style={styles.hint} className="mt-1 text-xs text-slate-500">{hint}</Text>
      ) : null}
      {error ? (
        <Text style={styles.error} className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  error: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
});
