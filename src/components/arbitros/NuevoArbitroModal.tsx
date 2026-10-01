import React, { useState } from 'react';
import { View, Text, Switch, Alert, Pressable } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArbitrosService } from '@/services/api';
import { GetArbitroDTO } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: (nuevo: GetArbitroDTO) => void;
}

const CATEGORIAS_DEFAULT = [
  'ASISTENTE',
  'AVANZADO',
  'PRINCIPAL_1',
  'PRINCIPAL_2',
  'INTERMEDIO',
  'ASPIRANTE',
];

export function NuevoArbitroModal({ visible, onClose, onCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [categoria, setCategoria] = useState('ASISTENTE');
  const [whatsapp, setWhatsapp] = useState('');
  const [tieneAuto, setTieneAuto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setCategoria('ASISTENTE');
    setWhatsapp('');
    setTieneAuto(false);
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Atención', 'Ingresa nombre y apellido del colegiado');
      return;
    }

    try {
      setGuardando(true);
      const res = await ArbitrosService.crear({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        categoria,
        whatsapp: whatsapp.trim() || undefined,
        tieneAuto,
        activo: true,
      });

      resetForm();
      onClose();
      onCreado(res);
      Alert.alert('Éxito', 'Árbitro incorporado al padrón oficial');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar el árbitro');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Registrar Nuevo Árbitro"
      subtitle="Alta en Padrón Oficial CIRCAJA"
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title="Guardar Árbitro"
            variant="primary"
            loading={guardando}
            onPress={handleGuardar}
          />
        </>
      }>
      <View className="py-2">
        <Input
          label="Apellido *"
          placeholder="Ej: Lovera"
          value={apellido}
          onChangeText={setApellido}
          containerClassName="mb-3"
        />

        <Input
          label="Nombre *"
          placeholder="Ej: Andrés"
          value={nombre}
          onChangeText={setNombre}
          containerClassName="mb-3"
        />

        <Input
          label="WhatsApp / Teléfono"
          placeholder="Ej: 5493743487344"
          value={whatsapp}
          onChangeText={setWhatsapp}
          containerClassName="mb-3"
        />

        <View className="mb-3">
          <Text className="mb-1.5 text-xs font-semibold text-slate-700">
            Categoría Oficial
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {CATEGORIAS_DEFAULT.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategoria(cat)}
                className={`rounded-lg px-2.5 py-1.5 border ${
                  categoria === cat
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50'
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    categoria === cat ? 'text-emerald-800' : 'text-slate-600'
                  }`}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
          <View>
            <Text className="text-xs font-semibold text-slate-800">
              Dispone de Vehículo Propio
            </Text>
            <Text className="text-[11px] text-slate-500">
              Para viajes y designaciones interprovinciales
            </Text>
          </View>
          <Switch value={tieneAuto} onValueChange={setTieneAuto} />
        </View>
      </View>
    </AppModal>
  );
}
