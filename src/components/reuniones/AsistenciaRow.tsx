import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { EstadoAsistencia, GetAsistenciaDTO } from '@/types';

interface Props {
  asistencia: GetAsistenciaDTO;
  onChangeEstado: (nuevoEstado: EstadoAsistencia) => void;
  onToggleSabado: () => void;
  onToggleDomingo: () => void;
  onChangeObservacion: (obs: string) => void;
}

export function AsistenciaRow({
  asistencia,
  onChangeEstado,
  onToggleSabado,
  onToggleDomingo,
  onChangeObservacion,
}: Props) {
  const { arbitro, estadoAsistencia, disponibleSabado, disponibleDomingo, observacion } =
    asistencia;

  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      {/* Cabecera árbitro */}
      <View className="flex-row flex-wrap items-center justify-between gap-y-2">
        <View className="flex-1 min-w-[150px] pr-2">
          <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
            {arbitro.apellido}, {arbitro.nombre}
          </Text>
          <Text className="text-xs text-slate-500 font-medium" numberOfLines={1}>
            {arbitro.categoria || 'Colegiado'}{' '}
            {arbitro.tieneAuto ? '• 🚗 Auto' : ''}
          </Text>
        </View>

        {/* Estado de Asistencia Buttons con wrap seguro */}
        <View className="flex-row flex-wrap gap-1">
          <Pressable
            onPress={() => onChangeEstado('PRESENTE')}
            className={`rounded-lg px-2.5 py-1.5 ${
              estadoAsistencia === 'PRESENTE'
                ? 'bg-emerald-600'
                : 'bg-slate-100 active:bg-slate-200'
            }`}>
            <Text
              className={`text-xs font-bold ${
                estadoAsistencia === 'PRESENTE'
                  ? 'text-white'
                  : 'text-slate-600'
              }`}>
              Presente
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onChangeEstado('JUSTIFICADO')}
            className={`rounded-lg px-2 py-1.5 ${
              estadoAsistencia === 'JUSTIFICADO'
                ? 'bg-amber-600'
                : 'bg-slate-100 active:bg-slate-200'
            }`}>
            <Text
              className={`text-xs font-bold ${
                estadoAsistencia === 'JUSTIFICADO'
                  ? 'text-white'
                  : 'text-slate-600'
              }`}>
              Justif.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onChangeEstado('AUSENTE')}
            className={`rounded-lg px-2.5 py-1.5 ${
              estadoAsistencia === 'AUSENTE'
                ? 'bg-rose-600'
                : 'bg-slate-100 active:bg-slate-200'
            }`}>
            <Text
              className={`text-xs font-bold ${
                estadoAsistencia === 'AUSENTE'
                  ? 'text-white'
                  : 'text-slate-600'
              }`}>
              Ausente
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Disponibilidad Fin de Semana */}
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 pt-2.5">
        <Text className="text-xs font-bold text-slate-700">
          Disponibilidad Finde:
        </Text>

        <View className="flex-row gap-2">
          <Pressable
            onPress={onToggleSabado}
            className={`flex-row items-center rounded-lg border px-3 py-1 ${
              disponibleSabado
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-300 bg-slate-50'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                disponibleSabado ? 'text-blue-700' : 'text-slate-400'
              }`}>
              {disponibleSabado ? '✓ Sábado' : '✗ Sábado'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onToggleDomingo}
            className={`flex-row items-center rounded-lg border px-3 py-1 ${
              disponibleDomingo
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-300 bg-slate-50'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                disponibleDomingo ? 'text-blue-700' : 'text-slate-400'
              }`}>
              {disponibleDomingo ? '✓ Domingo' : '✗ Domingo'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Input de Observaciones individual */}
      <View className="mt-2.5">
        <TextInput
          placeholder="Observación o justificación..."
          placeholderTextColor="#94a3b8"
          value={observacion || ''}
          onChangeText={onChangeObservacion}
          className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-800 border border-slate-200"
        />
      </View>
    </View>
  );
}
