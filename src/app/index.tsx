import { LoginModal } from "@/components/auth/LoginModal";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { NuevaReunionModal } from "@/components/reuniones/NuevaReunionModal";
import { ReunionCard } from "@/components/reuniones/ReunionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApiConfig, ArbitrosService, ReunionesService } from "@/services/api";
import { GetReunionDetalleDTO, GetReunionResumenDTO } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 680;
  const statCardWidth = isMobile ? (width < 380 ? "100%" : "47%") : undefined;
  const [reuniones, setReuniones] = useState<GetReunionResumenDTO[]>([]);
  const [totalArbitros, setTotalArbitros] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "TODAS" | "EN_CURSO" | "FINALIZADAS"
  >("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Modales
  const [modalNuevaReunion, setModalNuevaReunion] = useState(false);
  const [modalLogin, setModalLogin] = useState(false);
  const [tokenActivo, setTokenActivo] = useState(ApiConfig.getToken());

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resReuniones, resArbitros] = await Promise.all([
        ReunionesService.listar(0, 50),
        ArbitrosService.listar(0, 50),
      ]);
      setReuniones(resReuniones.content || []);
      setTotalArbitros(
        resArbitros.totalElements ?? resArbitros.content?.length ?? 0,
      );
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBuscarPorFecha = async () => {
    if (!fechaDesde && !fechaHasta) {
      cargarDatos();
      return;
    }
    try {
      setLoading(true);
      const res = await ReunionesService.buscarPorFecha(fechaDesde, fechaHasta);
      setReuniones(res.content || []);
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudieron buscar reuniones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleEliminarReunion = async (id: number) => {
    Alert.alert(
      "Eliminar Reunión",
      "¿Estás seguro de que deseas eliminar esta reunión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await ReunionesService.eliminar(id);
              cargarDatos();
            } catch (err: any) {
              Alert.alert("Error", err.message || "No se pudo eliminar");
            }
          },
        },
      ],
    );
  };

  const handleReunionCreada = (nueva: GetReunionDetalleDTO) => {
    cargarDatos();
    router.push(`/reunion/${nueva.idReunion}`);
  };

  // Filtrado
  const reunionesFiltradas = useMemo(() => {
    return reuniones.filter((r) => {
      const matchTexto =
        r.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.lugar.toLowerCase().includes(busqueda.toLowerCase()) ||
        (r.observaciones || "").toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado =
        filtroEstado === "TODAS"
          ? true
          : filtroEstado === "EN_CURSO"
            ? r.editable !== false
            : r.editable === false;

      return matchTexto && matchEstado;
    });
  }, [reuniones, busqueda, filtroEstado]);

  const abiertasCount = reuniones.filter((r) => r.editable !== false).length;

  return (
    <View style={styles.screen} className="bg-slate-50">
      {/* Top Header */}
      <AppHeader
        onNuevaReunion={() => setModalNuevaReunion(true)}
        onLogin={() => setModalLogin(true)}
        reunionesCount={reuniones.length}
        userPhone={tokenActivo ? "Conectado" : "Ingresar"}
      />

      <FlatList
        data={reunionesFiltradas}
        keyExtractor={(item) => String(item.idReunion)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View
            style={styles.contentContainer}
            className="mx-auto w-full max-w-7xl px-4 pt-6"
          >
            {/* Breadcrumb */}
            <Text
              style={styles.breadcrumb}
              className="text-[11px] font-black uppercase tracking-wider text-emerald-700"
            >
              COLEGIO DE ÁRBITROS • GESTIÓN DE ASAMBLEAS
            </Text>

            {/* Page Header Row */}
            <View
              style={styles.headingRow}
              className="mt-1 flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5"
            >
              <View style={{ flex: 1, minWidth: isMobile ? "100%" : 260 }}>
                <Text
                  style={styles.mainTitle}
                  className="text-2xl md:text-3xl font-black tracking-tight text-slate-900"
                >
                  Reuniones Técnicas
                </Text>
                <Text
                  style={styles.subtitle}
                  className="mt-1 text-xs md:text-sm text-slate-500 font-normal max-w-2xl leading-relaxed"
                >
                  Registro de actas, temáticas reglamentarias IFAB debatidas y
                  control de asistencia con observaciones individuales.
                </Text>
              </View>

              <Button
                title="Nueva Reunión"
                variant="primary"
                size="md"
                icon="⊕"
                onPress={() => setModalNuevaReunion(true)}
              />
            </View>

            {/* 4 Stat Cards */}
            <View
              style={[styles.statCardsRow, isMobile && { gap: 10 }]}
              className="mt-5 flex-row flex-wrap gap-3.5"
            >
              {/* Card 1 */}
              <View
                style={[
                  styles.statCard,
                  isMobile && { flex: undefined, width: statCardWidth, minWidth: 0 },
                ]}
                className="flex-1 min-w-[150px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View style={styles.statCardHeader}>
                  <Text
                    style={styles.statLabel}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    REUNIONES
                  </Text>
                  <Text style={{ fontSize: 13 }}>📅</Text>
                </View>
                <Text
                  style={styles.statNumber}
                  className="mt-2 text-2xl md:text-3xl font-black text-slate-900"
                >
                  {reuniones.length}
                </Text>
                <Text
                  style={styles.statSubtext}
                  className="mt-0.5 text-xs text-slate-400 font-medium"
                >
                  en historial
                </Text>
              </View>

              {/* Card 2 */}
              <View
                style={[
                  styles.statCard,
                  isMobile && { flex: undefined, width: statCardWidth, minWidth: 0 },
                ]}
                className="flex-1 min-w-[150px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View style={styles.statCardHeader}>
                  <Text
                    style={styles.statLabel}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    SESIONES EN CURSO
                  </Text>
                  <Text style={{ fontSize: 13 }}>🕒</Text>
                </View>
                <Text
                  style={[styles.statNumber, { color: "#059669" }]}
                  className="mt-2 text-2xl md:text-3xl font-black text-emerald-600"
                >
                  {abiertasCount}
                </Text>
                <Text
                  style={styles.statSubtext}
                  className="mt-0.5 text-xs text-slate-400 font-medium"
                >
                  abiertas
                </Text>
              </View>

              {/* Card 3 */}
              <View
                style={[
                  styles.statCard,
                  isMobile && { flex: undefined, width: statCardWidth, minWidth: 0 },
                ]}
                className="flex-1 min-w-[150px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View style={styles.statCardHeader}>
                  <Text
                    style={styles.statLabel}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    PADRÓN ÁRBITROS
                  </Text>
                  <Text style={{ fontSize: 13 }}>👥</Text>
                </View>
                <Text
                  style={styles.statNumber}
                  className="mt-2 text-2xl md:text-3xl font-black text-slate-900"
                >
                  {totalArbitros}
                </Text>
                <Text
                  style={styles.statSubtext}
                  className="mt-0.5 text-xs text-slate-400 font-medium"
                >
                  colegiados activos
                </Text>
              </View>

              {/* Card 4 */}
              <View
                style={[
                  styles.statCard,
                  isMobile && { flex: undefined, width: statCardWidth, minWidth: 0 },
                ]}
                className="flex-1 min-w-[150px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View style={styles.statCardHeader}>
                  <Text
                    style={styles.statLabel}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    ASISTENCIA PROMEDIO
                  </Text>
                  <Text style={{ fontSize: 13 }}>✓</Text>
                </View>
                <Text
                  style={[styles.statNumber, { color: "#059669" }]}
                  className="mt-2 text-2xl md:text-3xl font-black text-emerald-600"
                >
                  0%
                </Text>
                <Text
                  style={styles.statSubtext}
                  className="mt-0.5 text-xs text-slate-400 font-medium"
                >
                  quórum medio
                </Text>
              </View>
            </View>

            {/* Filter and Search Container Card */}
            <View
              style={styles.filterCard}
              className="mt-5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3"
            >
              {/* Row 1: Search input + Status Pills */}
              <View
                style={styles.filterTopRow}
                className="flex-row flex-wrap items-center justify-between gap-3"
              >
                <View
                  style={[
                    styles.searchInputContainer,
                    isMobile && { minWidth: "100%", width: "100%" },
                  ]}
                  className="flex-1 min-w-[200px] flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5"
                >
                  <Text style={{ fontSize: 12, marginRight: 8 }}>🔍</Text>
                  <TextInput
                    placeholder="Buscar reunión o tema tratado..."
                    placeholderTextColor="#94a3b8"
                    value={busqueda}
                    onChangeText={setBusqueda}
                    style={styles.textInput}
                    className="flex-1 text-xs text-slate-900"
                  />
                  {busqueda ? (
                    <Pressable onPress={() => setBusqueda("")}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          fontWeight: "bold",
                        }}
                      >
                        ✕
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* Filter Pills in Horizontal ScrollView */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.statusPillsRow}
                >
                  <Pressable
                    onPress={() => setFiltroEstado("TODAS")}
                    style={[
                      styles.filterPill,
                      filtroEstado === "TODAS" && styles.filterPillActive,
                    ]}
                    className={`rounded-xl px-3 py-1.5 ${
                      filtroEstado === "TODAS"
                        ? "bg-slate-900"
                        : "bg-transparent active:bg-slate-100"
                    }`}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        filtroEstado === "TODAS" && styles.filterPillTextActive,
                      ]}
                      className={`text-xs font-semibold ${
                        filtroEstado === "TODAS"
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      Todas ({reuniones.length})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFiltroEstado("EN_CURSO")}
                    style={[
                      styles.filterPill,
                      filtroEstado === "EN_CURSO" && styles.filterPillActive,
                    ]}
                    className={`rounded-xl px-3 py-1.5 ${
                      filtroEstado === "EN_CURSO"
                        ? "bg-slate-900"
                        : "bg-transparent active:bg-slate-100"
                    }`}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        filtroEstado === "EN_CURSO" &&
                          styles.filterPillTextActive,
                      ]}
                      className={`text-xs font-semibold ${
                        filtroEstado === "EN_CURSO"
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      En Curso
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFiltroEstado("FINALIZADAS")}
                    style={[
                      styles.filterPill,
                      filtroEstado === "FINALIZADAS" && styles.filterPillActive,
                    ]}
                    className={`rounded-xl px-3 py-1.5 ${
                      filtroEstado === "FINALIZADAS"
                        ? "bg-slate-900"
                        : "bg-transparent active:bg-slate-100"
                    }`}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        filtroEstado === "FINALIZADAS" &&
                          styles.filterPillTextActive,
                      ]}
                      className={`text-xs font-semibold ${
                        filtroEstado === "FINALIZADAS"
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      Finalizadas
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Row 2: Date Filters in Horizontal ScrollView */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
              >
                <View
                  style={styles.dateFilterRow}
                  className="flex-row items-center gap-2 border-t border-slate-100 pt-3"
                >
                  <Text
                    style={styles.dateFilterTitle}
                    className="text-xs font-semibold text-slate-700 flex-row items-center gap-1"
                  >
                    📅 Buscar por fecha:
                  </Text>

                  <View
                    style={styles.dateInputWrapper}
                    className="flex-row items-center gap-1.5"
                  >
                    <Text
                      style={styles.dateTag}
                      className="text-[11px] font-bold text-slate-400 uppercase"
                    >
                      DESDE
                    </Text>
                    <TextInput
                      placeholder="dd/mm/aaaa 📅"
                      placeholderTextColor="#94a3b8"
                      value={fechaDesde}
                      onChangeText={setFechaDesde}
                      style={styles.dateTextInput}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800"
                    />
                  </View>

                  <Text style={{ color: "#cbd5e1", fontSize: 12 }}>—</Text>

                  <View
                    style={styles.dateInputWrapper}
                    className="flex-row items-center gap-1.5"
                  >
                    <Text
                      style={styles.dateTag}
                      className="text-[11px] font-bold text-slate-400 uppercase"
                    >
                      HASTA
                    </Text>
                    <TextInput
                      placeholder="dd/mm/aaaa 📅"
                      placeholderTextColor="#94a3b8"
                      value={fechaHasta}
                      onChangeText={setFechaHasta}
                      style={styles.dateTextInput}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800"
                    />
                  </View>

                  <Button
                    title="Buscar"
                    variant="subtle-green"
                    size="sm"
                    icon="🔍"
                    onPress={handleBuscarPorFecha}
                  />
                </View>
              </ScrollView>
            </View>

            <View style={{ height: 16 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={styles.contentContainer}
            className="mx-auto w-full max-w-7xl px-4"
          >
            <ReunionCard
              reunion={item}
              onPress={() => router.push(`/reunion/${item.idReunion}`)}
              onEliminar={() => handleEliminarReunion(item.idReunion)}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View
              style={styles.emptyContainer}
              className="mx-auto w-full max-w-7xl px-4 py-12 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white"
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}
              >
                No hay reuniones registradas
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 4,
                  textAlign: "center",
                  maxWidth: 300,
                }}
              >
                Crea una nueva reunión usando el botón superior para convocar
                árbitros y cargar el orden del día.
              </Text>
              <Button
                style={{ marginTop: 16 }}
                title="Crear Primera Reunión"
                variant="primary"
                onPress={() => setModalNuevaReunion(true)}
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          <View
            style={styles.contentContainer}
            className="mx-auto w-full max-w-7xl px-4 mt-2"
          >
            {/* API / Pagination Bar */}
            <View
              style={styles.paginationCard}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm flex-row flex-wrap items-center justify-between gap-2"
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Badge
                  label="API: /reuniones"
                  variant="green"
                  size="sm"
                  rounded="md"
                />
                <Text
                  style={{ fontSize: 12, color: "#64748b", fontWeight: "500" }}
                >
                  Total: {reuniones.length} reuniones
                </Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Pressable
                  style={styles.pageBtn}
                  className="h-8 w-8 rounded-lg border border-slate-200 items-center justify-center active:bg-slate-50"
                >
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    ‹
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#334155",
                    paddingHorizontal: 6,
                  }}
                >
                  Pág. 1 / 1
                </Text>
                <Pressable
                  style={styles.pageBtn}
                  className="h-8 w-8 rounded-lg border border-slate-200 items-center justify-center active:bg-slate-50"
                >
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    ›
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onRefresh}
                  style={[styles.pageBtn, { marginLeft: 4 }]}
                  className="h-8 w-8 rounded-lg border border-slate-200 items-center justify-center active:bg-slate-50 ml-1"
                >
                  <Text style={{ fontSize: 12 }}>🔄</Text>
                </Pressable>
              </View>
            </View>

            {/* Bottom Footer */}
            <AppFooter />
          </View>
        }
      />

      {/* Modal Nueva Reunión */}
      <NuevaReunionModal
        visible={modalNuevaReunion}
        onClose={() => setModalNuevaReunion(false)}
        onCreada={handleReunionCreada}
      />

      {/* Modal Login */}
      <LoginModal
        visible={modalLogin}
        onClose={() => {
          setModalLogin(false);
          setTokenActivo(ApiConfig.getToken());
        }}
        onSuccess={() => setTokenActivo(ApiConfig.getToken())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 1280,
    marginHorizontal: "auto",
    paddingHorizontal: 16,
  },
  breadcrumb: {
    fontSize: 11,
    fontWeight: "900",
    color: "#047857",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
    marginTop: 4,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  statCardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 8,
  },
  statSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
  },
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginTop: 20,
    gap: 12,
  },
  filterTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    minWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: "#0f172a",
    padding: 0,
  },
  statusPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: "#0f172a",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  dateFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  dateFilterTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
  },
  dateTextInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    color: "#1e293b",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    backgroundColor: "#ffffff",
  },
  paginationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
});
