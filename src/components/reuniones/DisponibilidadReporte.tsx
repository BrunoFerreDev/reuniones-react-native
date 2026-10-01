import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GetDisponibilidadFinDeSemanaDTO } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface Props {
  reporte: GetDisponibilidadFinDeSemanaDTO;
}

export function DisponibilidadReporte({ reporte }: Props) {
  return (
    <View className="flex-1 w-full">
      {/* Resumen métricas */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        <View className="flex-1 min-w-[140px] rounded-xl bg-white p-3.5 shadow-sm border border-slate-200">
          <Text className="text-xs text-slate-500 font-medium">Total Evaluados</Text>
          <Text className="text-xl font-bold text-slate-900 mt-0.5">
            {reporte.totalEvaluados}
          </Text>
        </View>

        <View className="flex-1 min-w-[140px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <Text className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Ambos Días</Text>
          <Text className="text-2xl font-black text-emerald-800 mt-1">
            {reporte.totalDisponiblesAmbosDias}
          </Text>
        </View>

        <View className="flex-1 min-w-[140px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <Text className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Sábado Total</Text>
          <Text className="text-2xl font-black text-emerald-700 mt-1">
            {reporte.totalDisponiblesSabado}
          </Text>
        </View>

        <View className="flex-1 min-w-[140px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <Text className="text-xs text-purple-600 font-bold uppercase tracking-wider">Domingo Total</Text>
          <Text className="text-2xl font-black text-purple-700 mt-1">
            {reporte.totalDisponiblesDomingo}
          </Text>
        </View>

        <View className="flex-1 min-w-[140px] rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <Text className="text-xs text-rose-600 font-bold uppercase tracking-wider">No Disponibles</Text>
          <Text className="text-2xl font-black text-rose-700 mt-1">
            {reporte.totalNoDisponibles}
          </Text>
        </View>
      </View>

      {/* Sección: Disponibles Ambos Días */}
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-emerald-800">
            Disponibles Sábado y Domingo ({reporte.disponiblesAmbosDias.length})
          </Text>
          <Badge label="Ambos Días" variant="green" rounded="md" />
        </View>

        {reporte.disponiblesAmbosDias.length === 0 ? (
          <Text className="text-xs text-slate-400 italic">Ningún árbitro en este grupo</Text>
        ) : (
          reporte.disponiblesAmbosDias.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
              <View>
                <Text className="text-xs font-bold text-slate-900">
                  {item.arbitro.apellido}, {item.arbitro.nombre}
                </Text>
                <Text className="text-[11px] text-slate-500">
                  {item.arbitro.categoria || 'Colegiado'} {item.arbitro.tieneAuto ? '• 🚗 Auto' : ''}
                </Text>
              </View>
              {item.observacion ? (
                <Text className="text-[11px] text-slate-500 max-w-[150px]" numberOfLines={1}>
                  {item.observacion}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Sección: Sólo Sábado */}
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-emerald-700">
            Sólo Sábado ({reporte.disponiblesSabado.length})
          </Text>
          <Badge label="Sábado" variant="green" />
        </View>

        {reporte.disponiblesSabado.length === 0 ? (
          <Text className="text-xs text-slate-400 italic">Ningún árbitro en este grupo</Text>
        ) : (
          reporte.disponiblesSabado.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
              <View>
                <Text className="text-xs font-bold text-slate-900">
                  {item.arbitro.apellido}, {item.arbitro.nombre}
                </Text>
                <Text className="text-[11px] text-slate-500">
                  {item.arbitro.categoria || 'Colegiado'} {item.arbitro.tieneAuto ? '• 🚗 Auto' : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Sección: Sólo Domingo */}
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-purple-700">
            Sólo Domingo ({reporte.disponiblesDomingo.length})
          </Text>
          <Badge label="Domingo" variant="purple" />
        </View>

        {reporte.disponiblesDomingo.length === 0 ? (
          <Text className="text-xs text-slate-400 italic">Ningún árbitro en este grupo</Text>
        ) : (
          reporte.disponiblesDomingo.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
              <View>
                <Text className="text-xs font-bold text-slate-900">
                  {item.arbitro.apellido}, {item.arbitro.nombre}
                </Text>
                <Text className="text-[11px] text-slate-500">
                  {item.arbitro.categoria || 'Colegiado'} {item.arbitro.tieneAuto ? '• 🚗 Auto' : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Sección: No Disponibles */}
      <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-rose-700">
            No Disponibles ({reporte.noDisponibles.length})
          </Text>
          <Badge label="Sin Disponibilidad" variant="red" />
        </View>

        {reporte.noDisponibles.length === 0 ? (
          <Text className="text-xs text-slate-400 italic">Todos disponibles este fin de semana</Text>
        ) : (
          reporte.noDisponibles.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
              <View>
                <Text className="text-xs font-bold text-slate-900">
                  {item.arbitro.apellido}, {item.arbitro.nombre}
                </Text>
                <Text className="text-[11px] text-slate-500">
                  Motivo: {item.observacion || 'Sin motivo especificado'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
