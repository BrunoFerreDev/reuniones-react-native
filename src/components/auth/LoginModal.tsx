import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { AuthService } from '@/services/api';
import { AppModal } from '@/components/ui/AppModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (username: string) => void;
}

export function LoginModal({ visible, onClose, onSuccess }: LoginModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!whatsapp.trim()) {
      Alert.alert('Atención', 'Ingresa tu número de WhatsApp o usuario');
      return;
    }

    try {
      setLoading(true);
      const res = await AuthService.login({
        whatsapp: whatsapp.trim(),
        password: password.trim() || undefined,
      });

      Alert.alert('Bienvenido', `Sesión iniciada como ${res.username}`);
      onClose();
      if (onSuccess) {
        onSuccess(res.username);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Acceso Secretario / Directivo"
      subtitle="CIRCAJA - Panel de Gestión Arbitral"
      footer={
        <>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
          />
          <Button
            title="Iniciar Sesión"
            variant="primary"
            loading={loading}
            onPress={handleLogin}
          />
        </>
      }>
      <View className="py-2">
        <Text className="text-xs text-slate-600 mb-4 leading-relaxed">
          Ingresa con tu número de WhatsApp registrado o usuario de comisión para gestionar actas, asistencias y convocatorias.
        </Text>

        <Input
          label="WhatsApp o Usuario"
          placeholder="Ej: +5493764000000 o secretario"
          value={whatsapp}
          onChangeText={setWhatsapp}
          containerClassName="mb-3"
          autoCapitalize="none"
        />

        <Input
          label="Contraseña"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          containerClassName="mb-2"
        />
      </View>
    </AppModal>
  );
}
