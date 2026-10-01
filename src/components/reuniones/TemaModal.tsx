import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { AppModal } from '@/components/ui/AppModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TemaReunionDTO } from '@/types';

interface TemaModalProps {
  visible: boolean;
  onClose: () => void;
  temaEditar?: TemaReunionDTO | null;
  onGuardar: (tema: TemaReunionDTO) => void;
}

export function TemaModal({
  visible,
  onClose,
  temaEditar,
  onGuardar,
}: TemaModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempoMinutos, setTiempoMinutos] = useState('20');
  const [urlMaterial, setUrlMaterial] = useState('');
  const [conclusiones, setConclusiones] = useState('');

  React.useEffect(() => {
    if (visible) {
      if (temaEditar) {
        setTitulo(temaEditar.titulo);
        setDescripcion(temaEditar.descripcion || '');
        setTiempoMinutos(temaEditar.tiempoMinutos ? String(temaEditar.tiempoMinutos) : '20');
        setUrlMaterial(temaEditar.urlMaterial || '');
        setConclusiones(temaEditar.conclusiones || '');
      } else {
        setTitulo('');
        setDescripcion('');
        setTiempoMinutos('20');
        setUrlMaterial('');
        setConclusiones('');
      }
    }
  }, [visible, temaEditar]);

  const handleGuardar = () => {
    if (!titulo.trim()) {
      Alert.alert('Atención', 'Ingresa el título del tema');
      return;
    }

    onGuardar({
      idTema: temaEditar?.idTema,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      tiempoMinutos: parseInt(tiempoMinutos, 10) || 15,
      urlMaterial: urlMaterial.trim() || undefined,
      conclusiones: conclusiones.trim() || undefined,
      orden: temaEditar?.orden,
    });
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={temaEditar ? 'Modificar Tema' : 'Nuevo Tema del Orden del Día'}
      subtitle="CIRCAJA - Comisión Técnica"
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title="Guardar Tema"
            variant="primary"
            onPress={handleGuardar}
          />
        </>
      }>
      <View className="py-2">
        <Input
          label="Título del Tema *"
          placeholder="Ej: Análisis jugadas polémicas fecha 5"
          value={titulo}
          onChangeText={setTitulo}
          containerClassName="mb-3"
        />

        <Input
          label="Tiempo estimado (minutos)"
          placeholder="20"
          keyboardType="numeric"
          value={tiempoMinutos}
          onChangeText={setTiempoMinutos}
          containerClassName="mb-3"
        />

        <Input
          label="Descripción / Puntos Clave"
          placeholder="Detalles de la discusión técnica..."
          multiline
          numberOfLines={3}
          value={descripcion}
          onChangeText={setDescripcion}
          containerClassName="mb-3"
        />

        <Input
          label="Enlace de Material / Video / Circular"
          placeholder="https://drive.google.com/..."
          value={urlMaterial}
          onChangeText={setUrlMaterial}
          containerClassName="mb-3"
        />

        <Input
          label="Conclusiones y Resoluciones (Opcional)"
          placeholder="Acuerdos finales adoptados por el colegio..."
          multiline
          numberOfLines={3}
          value={conclusiones}
          onChangeText={setConclusiones}
          containerClassName="mb-2"
        />
      </View>
    </AppModal>
  );
}
