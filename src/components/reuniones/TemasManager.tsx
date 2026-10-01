import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TemaReunionDTO } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TemaModal } from '@/components/reuniones/TemaModal';

interface Props {
  temas: TemaReunionDTO[];
  onGuardarTemas: (nuevosTemas: TemaReunionDTO[]) => void;
  editable?: boolean;
}

export function TemasManager({ temas, onGuardarTemas, editable = true }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [temaSeleccionado, setTemaSeleccionado] = useState<TemaReunionDTO | null>(null);
  const [indiceEditar, setIndiceEditar] = useState<number | null>(null);

  const abrirNuevoTema = () => {
    setTemaSeleccionado(null);
    setIndiceEditar(null);
    setModalVisible(true);
  };

  const abrirEditarTema = (idx: number) => {
    setTemaSeleccionado(temas[idx]);
    setIndiceEditar(idx);
    setModalVisible(true);
  };

  const handleGuardarModal = (temaActualizado: TemaReunionDTO) => {
    let lista: TemaReunionDTO[];
    if (indiceEditar !== null) {
      lista = [...temas];
      lista[indiceEditar] = { ...lista[indiceEditar], ...temaActualizado };
    } else {
      lista = [...temas, temaActualizado];
    }
    onGuardarTemas(lista);
  };

  const eliminarTema = (idx: number) => {
    const lista = temas.filter((_, i) => i !== idx);
    onGuardarTemas(lista);
  };

  return (
    <View className="w-full">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-slate-900">
          Temas del Orden del Día ({temas.length})
        </Text>
        {editable ? (
          <Button
            size="sm"
            title="+ Agregar Tema"
            variant="primary"
            onPress={abrirNuevoTema}
          />
        ) : null}
      </View>

      {temas.length === 0 ? (
        <View className="rounded-xl border border-dashed border-slate-300 p-6 items-center bg-white">
          <Text className="text-sm text-slate-500">
            No se han registrado temas todavía para esta reunión.
          </Text>
        </View>
      ) : (
        temas.map((tema, index) => (
          <View
            key={index}
            className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-slate-900">
                  {index + 1}. {tema.titulo}
                </Text>
              </View>
              {tema.tiempoMinutos ? (
                <Badge label={`⏱️ ${tema.tiempoMinutos}m`} variant="gray" />
              ) : null}
            </View>

            {tema.descripcion ? (
              <Text className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {tema.descripcion}
              </Text>
            ) : null}

            {tema.urlMaterial ? (
              <Text className="mt-1 text-xs text-blue-600 underline">
                🔗 {tema.urlMaterial}
              </Text>
            ) : null}

            {tema.conclusiones ? (
              <View className="mt-2.5 rounded-lg bg-emerald-50 p-2.5 border border-emerald-200">
                <Text className="text-[11px] font-bold text-emerald-800">
                  Conclusiones / Acuerdos:
                </Text>
                <Text className="text-xs text-emerald-900 mt-0.5">
                  {tema.conclusiones}
                </Text>
              </View>
            ) : null}

            {editable ? (
              <View className="mt-3 flex-row justify-end gap-2 border-t border-slate-100 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  title="Editar"
                  onPress={() => abrirEditarTema(index)}
                />
                <Button
                  size="sm"
                  variant="danger"
                  title="Eliminar"
                  onPress={() => eliminarTema(index)}
                />
              </View>
            ) : null}
          </View>
        ))
      )}

      {/* Modal para alta / edición de temas */}
      <TemaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        temaEditar={temaSeleccionado}
        onGuardar={handleGuardarModal}
      />
    </View>
  );
}
