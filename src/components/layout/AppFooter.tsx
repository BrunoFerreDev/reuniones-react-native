import React from 'react';
import { View, Text } from 'react-native';

export function AppFooter() {
  return (
    <View className="w-full border-t border-slate-200 bg-white py-4 mt-8">
      <View className="mx-auto w-full max-w-7xl px-4 flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-xs font-semibold text-slate-700">
          <Text className="font-black text-slate-900">CIRCAJA</Text> • Colegio de Árbitros de Fútbol
        </Text>
        <Text className="text-xs text-slate-400">
          Sistema de Registro de Minutas, Análisis Reglamentario IFAB y Planilla de Asistencia.
        </Text>
      </View>
    </View>
  );
}
