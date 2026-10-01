import React, { useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CrearReunionDTO, GetReunionDetalleDTO } from '@/types';
import { ReunionesService } from '@/services/api';

interface NuevaReunionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreada: (reunion: GetReunionDetalleDTO) => void;
}

export function NuevaReunionModal({
  visible,
  onClose,
  onCreada,
}: NuevaReunionModalProps) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 16));
  const [lugar, setLugar] = useState('Sede Central Colegio de Árbitros');
  const [observaciones, setObservaciones] = useState('');
  const [sincronizar, setSincronizar] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const resetForm = () => {
    setTitulo('');
    setFecha(new Date().toISOString().slice(0, 16));
    setLugar('Sede Central Colegio de Árbitros');
    setObservaciones('');
    setSincronizar(true);
  };

  const handleCrear = async () => {
    if (!titulo.trim()) {
      Alert.alert('Atención', 'Ingresa el título de la reunión');
      return;
    }
    if (!lugar.trim()) {
      Alert.alert('Atención', 'Ingresa el lugar de la reunión');
      return;
    }

    try {
      setGuardando(true);
      const payload: CrearReunionDTO = {
        titulo: titulo.trim(),
        fecha: new Date(fecha).toISOString(),
        lugar: lugar.trim(),
        observaciones: observaciones.trim() || undefined,
        sincronizarArbitrosActivos: sincronizar,
        temas: [],
      };

      const res = await ReunionesService.crear(payload);
      resetForm();
      onClose();
      onCreada(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la reunión');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Crear Nueva Reunión"
      subtitle="Convocatoria y acta oficial"
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title="Guardar y Abrir"
            variant="primary"
            loading={guardando}
            onPress={handleCrear}
          />
        </>
      }>
      <View className="py-2">
        <Input
          label="Título de la Reunión *"
          placeholder="Ej: Sesión Técnica Semanal - Fecha 12"
          value={titulo}
          onChangeText={setTitulo}
          containerClassName="mb-3"
        />

        <Input
          label="Fecha y Hora *"
          placeholder="2026-09-30T19:30"
          value={fecha}
          onChangeText={setFecha}
          containerClassName="mb-3"
        />

        <Input
          label="Lugar o Sede *"
          placeholder="Sede Central Colegio de Árbitros"
          value={lugar}
          onChangeText={setLugar}
          containerClassName="mb-3"
        />

        <Input
          label="Observaciones Generales"
          placeholder="Puntualidad, traer informes firmados, etc."
          multiline
          numberOfLines={2}
          value={observaciones}
          onChangeText={setObservaciones}
          containerClassName="mb-3"
        />

        <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-semibold text-slate-800">
              Sincronizar Árbitros Activos
            </Text>
            <Text className="text-[11px] text-slate-500">
              Inicializa la planilla con todos los árbitros habilitados.
            </Text>
          </View>
          <Switch value={sincronizar} onValueChange={setSincronizar} />
        </View>
      </View>
    </AppModal>
  );
}
