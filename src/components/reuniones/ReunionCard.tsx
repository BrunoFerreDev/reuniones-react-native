import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GetReunionResumenDTO } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  reunion: GetReunionResumenDTO;
  onPress: () => void;
  onEliminar?: () => void;
}

export function ReunionCard({ reunion, onPress, onEliminar }: Props) {
  const dateObj = new Date(reunion.fecha);
  const formattedDate = dateObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.card} className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300">
      {/* Top Meta & Attendance Summary Row */}
      <View style={styles.topRow} className="flex-row flex-wrap items-center justify-between gap-y-2 border-b border-slate-100 pb-3">
        <View style={styles.dateBadgeRow} className="flex-row flex-wrap items-center gap-2">
          <Badge
            label="En Curso"
            variant="green"
            size="sm"
            rounded="full"
            dot={true}
          />
          <Text style={styles.dateText} className="text-xs text-slate-500 font-medium">
            📅 {formattedDate}
          </Text>
        </View>

        {/* 3 colored dots for attendance */}
        <View style={styles.statsDotsRow} className="flex-row items-center gap-3">
          <View style={styles.dotItem} className="flex-row items-center gap-1.5">
            <View style={[styles.dotCircle, { backgroundColor: '#10b981' }]} className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text style={styles.statDotText} className="text-xs font-semibold text-slate-600">
              {reunion.totalPresentes} presentes
            </Text>
          </View>
          <View style={styles.dotItem} className="flex-row items-center gap-1.5">
            <View style={[styles.dotCircle, { backgroundColor: '#f43f5e' }]} className="h-2 w-2 rounded-full bg-rose-500" />
            <Text style={styles.statDotText} className="text-xs font-semibold text-slate-600">
              {reunion.totalAusentes} ausentes
            </Text>
          </View>
          <View style={styles.dotItem} className="flex-row items-center gap-1.5">
            <View style={[styles.dotCircle, { backgroundColor: '#f59e0b' }]} className="h-2 w-2 rounded-full bg-amber-500" />
            <Text style={styles.statDotText} className="text-xs font-semibold text-slate-600">
              {reunion.totalJustificados} justif.
            </Text>
          </View>
        </View>
      </View>

      {/* Middle: Title & Location */}
      <View style={styles.middleSection} className="py-3">
        <Text style={styles.title} className="text-lg font-bold text-slate-900 leading-snug">
          {reunion.titulo}
        </Text>
        <Text style={styles.location} className="mt-1 text-xs text-slate-500 font-normal">
          📍 {reunion.lugar}
        </Text>
        {reunion.observaciones ? (
          <Text
            numberOfLines={2}
            style={styles.obs}
            className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
            {reunion.observaciones}
          </Text>
        ) : null}
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.bottomRow} className="flex-row items-center justify-end gap-2 border-t border-slate-100 pt-3">
        {onEliminar && (
          <Pressable
            onPress={onEliminar}
            hitSlop={8}
            style={styles.trashBtn}
            className="h-9 w-9 rounded-xl border border-slate-200 items-center justify-center active:bg-rose-50 active:border-rose-300">
            <Text style={{ fontSize: 13 }}>🗑️</Text>
          </Pressable>
        )}

        <Button
          title="Tomar Asistencia & Temas →"
          variant="primary"
          size="sm"
          onPress={onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statsDotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  dotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  middleSection: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  location: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  obs: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
