import { LoginModal } from "@/components/auth/LoginModal";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiConfig, AuthService } from "@/services/api";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AjustesScreen() {
  const insets = useSafeAreaInsets();
  const [baseUrl, setBaseUrl] = useState(
    ApiConfig.getBaseUrl() || "http://localhost:8085",
  );
  const [token, setToken] = useState(ApiConfig.getToken());
  const [modalLogin, setModalLogin] = useState(false);

  const guardarConfig = () => {
    ApiConfig.setBaseUrl(baseUrl.trim());
    ApiConfig.setToken(token.trim());
    Alert.alert("Guardado", "Configuración de conexión API actualizada.");
  };

  const probarConexion = async () => {
    try {
      const res = await fetch(
        `${baseUrl.replace(/\/+$/, "")}/reuniones?page=0&size=1`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (res.ok) {
        Alert.alert(
          "Conexión Exitosa",
          `Servidor respondió con código ${res.status}`,
        );
      } else {
        Alert.alert("Servidor respondió", `Código HTTP: ${res.status}`);
      }
    } catch (err: any) {
      Alert.alert(
        "Fallo de Conexión",
        `No se pudo conectar al host (${err.message}). Verifica que el servidor esté encendido en la URL indicada.`,
      );
    }
  };

  const cerrarSesion = () => {
    AuthService.logout();
    setToken("");
    Alert.alert("Sesión Cerrada", "Se eliminó el token Bearer actual.");
  };

  return (
    <View style={{ flex: 1 }} className="bg-slate-50">
      {/* Top Header */}
      <AppHeader onLogin={() => setModalLogin(true)} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View className="mx-auto w-full max-w-7xl px-4 pt-6">
          {/* Breadcrumb */}
          <Text className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
            CONFIGURACIÓN DEL SISTEMA
          </Text>

          {/* Heading Row */}
          <View className="mt-1 border-b border-slate-200 pb-5 mb-5">
            <Text className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Ajustes & Conexión API
            </Text>
            <Text className="mt-1 text-xs md:text-sm text-slate-500 font-normal">
              Configuración de endpoints Spring Boot y credenciales de acceso
            </Text>
          </View>

          {/* Tarjeta de Sesión */}
          <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Text className="text-sm font-bold text-slate-900 mb-1">
              Estado de Autenticación
            </Text>
            <Text className="text-xs text-slate-500 mb-4">
              {token
                ? "Sesión activa con token JWT configurado."
                : "No has iniciado sesión."}
            </Text>

            <View className="flex-row gap-2">
              {token ? (
                <Button
                  size="sm"
                  variant="danger"
                  title="Cerrar Sesión"
                  onPress={cerrarSesion}
                />
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  title="Abrir Modal de Login"
                  onPress={() => setModalLogin(true)}
                />
              )}
            </View>
          </View>

          {/* Tarjeta Servidor */}
          <View className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
            <Input
              label="Base URL del Backend"
              placeholder="http://localhost:8081"
              value={baseUrl}
              onChangeText={setBaseUrl}
              containerClassName="mb-3"
              hint="Ej: http://192.168.1.50:8081 para pruebas móviles locales"
            />

            <Input
              label="Token JWT Bearer"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={token}
              onChangeText={setToken}
              containerClassName="mb-4"
            />

            <View className="flex-row gap-2">
              <Button
                className="flex-1"
                variant="outline"
                title="Probar Conexión"
                onPress={probarConexion}
              />
              <Button
                className="flex-1"
                variant="primary"
                title="Guardar Configuración"
                onPress={guardarConfig}
              />
            </View>
          </View>

          <AppFooter />
        </View>
      </ScrollView>

      <LoginModal
        visible={modalLogin}
        onClose={() => {
          setModalLogin(false);
          setToken(ApiConfig.getToken());
        }}
        onSuccess={() => setToken(ApiConfig.getToken())}
      />
    </View>
  );
}
