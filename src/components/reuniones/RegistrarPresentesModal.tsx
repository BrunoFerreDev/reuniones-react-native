import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GetAsistenciaDTO } from '@/types';

interface RegistrarPresentesModalProps {
  visible: boolean;
  onClose: () => void;
  asistencias: GetAsistenciaDTO[];
  onConfirmar: (actualizadas: GetAsistenciaDTO[]) => void;
}

export function RegistrarPresentesModal({
  visible,
  onClose,
  asistencias,
  onConfirmar,
}: RegistrarPresentesModalProps) {
  const [seleccionados, setSeleccionados] = useState<Record<number, boolean>>({});

  // Inicializar seleccionados con los que ya están PRESENTES
  React.useEffect(() => {
    if (visible) {
      const mapa: Record<number, boolean> = {};
      asistencias.forEach((a) => {
        if (a.estadoAsistencia === 'PRESENTE') {
          mapa[a.arbitro.idArbitro] = true;
        }
      });
      setSeleccionados(mapa);
    }
  }, [visible, asistencias]);

  const toggleArbitro = (idArbitro: number) => {
    setSeleccionados((prev) => ({
      ...prev,
      [idArbitro]: !prev[idArbitro],
    }));
  };

  const seleccionarTodos = () => {
    const mapa: Record<number, boolean> = {};
    asistencias.forEach((a) => {
      mapa[a.arbitro.idArbitro] = true;
    });
    setSeleccionados(mapa);
  };

  const deseleccionarTodos = () => {
    setSeleccionados({});
  };

  const handleGuardar = () => {
    const actualizadas = asistencias.map((a) => {
      const esPresente = !!seleccionados[a.arbitro.idArbitro];
      return {
        ...a,
        estadoAsistencia: esPresente ? ('PRESENTE' as const) : a.estadoAsistencia === 'PRESENTE' ? ('AUSENTE' as const) : a.estadoAsistencia,
      };
    });
    onConfirmar(actualizadas);
    onClose();
  };

  const totalPresentes = Object.values(seleccionados).filter(Boolean).length;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Toma Rápida de Asistencia"
      subtitle="Toca a los árbitros presentes en el recinto"
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title={`Confirmar (${totalPresentes} Presentes)`}
            variant="success"
            onPress={handleGuardar}
          />
        </>
      }>
      <View className="py-1">
        {/* Acciones de selección masiva */}
        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <Text className="text-xs font-semibold text-slate-700">
            {totalPresentes} de {asistencias.length} presentes
          </Text>
          <View className="flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              title="Todos"
              onPress={seleccionarTodos}
            />
            <Button
              size="sm"
              variant="outline"
              title="Ninguno"
              onPress={deseleccionarTodos}
            />
          </View>
        </View>

        <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
          {asistencias.map((item) => {
            const isSelected = !!seleccionados[item.arbitro.idArbitro];
            return (
              <Pressable
                key={item.arbitro.idArbitro}
                onPress={() => toggleArbitro(item.arbitro.idArbitro)}
                className={`mb-2 flex-row items-center justify-between rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-bold text-slate-900">
                    {item.arbitro.apellido}, {item.arbitro.nombre}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {item.arbitro.categoria || 'Sin categoría'}
                  </Text>
                </View>

                <Badge
                  label={isSelected ? '✓ PRESENTE' : 'AUSENTE'}
                  variant={isSelected ? 'green' : 'gray'}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </AppModal>
  );
}
