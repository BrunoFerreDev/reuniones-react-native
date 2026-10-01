import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GetArbitroDTO, GetAsistenciaDTO } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  todosArbitros: GetArbitroDTO[];
  asistenciasActuales: GetAsistenciaDTO[];
  onAgregarArbitros: (nuevosArbitros: GetArbitroDTO[]) => void;
}

export function IncorporarArbitrosModal({
  visible,
  onClose,
  todosArbitros,
  asistenciasActuales,
  onAgregarArbitros,
}: Props) {
  const [seleccionados, setSeleccionados] = useState<Record<number, boolean>>({});
  const [busqueda, setBusqueda] = useState('');

  // Identificar árbitros ya presentes en la reunión
  const yaConvocadosIds = useMemo(() => {
    return new Set(asistenciasActuales.map((a) => a.arbitro.idArbitro));
  }, [asistenciasActuales]);

  // Árbitros disponibles para convocar
  const disponibles = useMemo(() => {
    return todosArbitros.filter((a) => !yaConvocadosIds.has(a.idArbitro));
  }, [todosArbitros, yaConvocadosIds]);

  const filtrados = useMemo(() => {
    return disponibles.filter((a) =>
      `${a.nombre} ${a.apellido} ${a.categoria || ''}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [disponibles, busqueda]);

  React.useEffect(() => {
    if (visible) {
      setSeleccionados({});
      setBusqueda('');
    }
  }, [visible]);

  const toggleArbitro = (id: number) => {
    setSeleccionados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const seleccionarTodos = () => {
    const mapa: Record<number, boolean> = {};
    filtrados.forEach((a) => {
      mapa[a.idArbitro] = true;
    });
    setSeleccionados(mapa);
  };

  const deseleccionarTodos = () => {
    setSeleccionados({});
  };

  const handleConfirmar = () => {
    const seleccionadosList = disponibles.filter((a) => !!seleccionados[a.idArbitro]);
    onAgregarArbitros(seleccionadosList);
    onClose();
  };

  const totalSeleccionados = Object.values(seleccionados).filter(Boolean).length;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Padrón Oficial de Colegiados"
      subtitle={`Selecciona árbitros para incorporar a la sesión (${disponibles.length} disponibles)`}
      scrollable={false}
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title={`Incorporar (${totalSeleccionados})`}
            variant="primary"
            disabled={totalSeleccionados === 0}
            onPress={handleConfirmar}
          />
        </>
      }>
      <View className="py-1 flex-1">
        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            backgroundColor: '#f8fafc',
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginBottom: 12,
          }}
          className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 mb-3">
          <Text className="mr-2 text-slate-400 text-xs">🔍</Text>
          <TextInput
            placeholder="Buscar por nombre, apellido, categoría..."
            placeholderTextColor="#94a3b8"
            value={busqueda}
            onChangeText={setBusqueda}
            className="flex-1 text-xs text-slate-900"
          />
        </View>

        {/* Action bar */}
        <View className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <Text className="text-xs font-semibold text-slate-600">
            {totalSeleccionados} seleccionados
          </Text>
          <View className="flex-row gap-1.5">
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

        {/* List */}
        <ScrollView
          className="max-h-96"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}>
          {filtrados.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Text className="text-xs text-slate-400 font-medium">
                {disponibles.length === 0
                  ? 'Todos los colegiados del padrón ya están convocados en esta sesión.'
                  : 'No se encontraron colegiados con el filtro.'}
              </Text>
            </View>
          ) : (
            filtrados.map((item) => {
              const isSelected = !!seleccionados[item.idArbitro];
              return (
                <Pressable
                  key={item.idArbitro}
                  onPress={() => toggleArbitro(item.idArbitro)}
                  style={{
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    borderColor: isSelected ? '#10b981' : '#e2e8f0',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  className={`mb-2 flex-row items-center justify-between rounded-xl border p-3 transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}>
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-slate-900">
                      {item.nombre} {item.apellido}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      {item.categoria || 'Sin categoría'} {item.whatsapp ? `• 📱 ${item.whatsapp}` : ''}
                    </Text>
                  </View>

                  <Badge
                    label={isSelected ? '✓ SELECCIONADO' : '+ AGREGAR'}
                    variant={isSelected ? 'green' : 'gray'}
                    rounded="md"
                  />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </AppModal>
  );
}
