import { NuevoArbitroModal } from "@/components/arbitros/NuevoArbitroModal";
import { LoginModal } from "@/components/auth/LoginModal";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApiConfig, ArbitrosService } from "@/services/api";
import { GetArbitroDTO } from "@/types";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

export default function ArbitrosScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const colWidth = width >= 1024 ? "33.333%" : isTablet ? "50%" : "100%";
  const [arbitros, setArbitros] = useState<GetArbitroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [menuCategoriaAbierto, setMenuCategoriaAbierto] = useState(false);

  // Modales
  const [arbitroSeleccionado, setArbitroSeleccionado] =
    useState<GetArbitroDTO | null>(null);
  const [modalNuevoArbitro, setModalNuevoArbitro] = useState(false);
  const [modalLogin, setModalLogin] = useState(false);
  const [tokenActivo, setTokenActivo] = useState(ApiConfig.getToken());

  const cargarArbitros = async () => {
    try {
      setLoading(true);
      const res = await ArbitrosService.listar(0, 100);
      setArbitros(res.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarArbitros();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarArbitros();
  };

  const categorias = useMemo(() => {
    const set = new Set<string>();
    arbitros.forEach((a) => {
      if (a.categoria) set.add(a.categoria);
    });
    return ["TODAS", ...Array.from(set)];
  }, [arbitros]);

  const arbitrosFiltrados = useMemo(() => {
    return arbitros.filter((a) => {
      const matchTexto =
        `${a.nombre} ${a.apellido} ${a.categoria || ""} ${a.whatsapp || ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      const matchCat =
        filtroCategoria === "TODAS" || a.categoria === filtroCategoria;

      return matchTexto && matchCat;
    });
  }, [arbitros, busqueda, filtroCategoria]);

  const getInitials = (item: GetArbitroDTO) => {
    const fn = (item.nombre || "").charAt(0);
    const ln = (item.apellido || "").charAt(0);
    return `${fn}${ln}`.toUpperCase() || "AR";
  };

  return (
    <View style={styles.screen} className="bg-slate-50">
      {/* Top Header */}
      <AppHeader
        onLogin={() => setModalLogin(true)}
        userPhone={tokenActivo ? "Conectado" : "Ingresar"}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={styles.contentContainer}
          className="mx-auto w-full max-w-7xl px-4 pt-6"
        >
          {/* Breadcrumb */}
          <Text
            style={styles.breadcrumb}
            className="text-[11px] font-black uppercase tracking-wider text-emerald-700"
          >
            COLEGIO DE ÁRBITROS • PADRÓN OFICIAL
          </Text>

          {/* Heading Row */}
          <View
            style={styles.headingRow}
            className="mt-1 flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5"
          >
            <View style={{ flex: 1, minWidth: isMobile ? "100%" : 260 }}>
              <Text
                style={styles.mainTitle}
                className="text-2xl md:text-3xl font-black tracking-tight text-slate-900"
              >
                Plantel de Árbitros
              </Text>
              <Text
                style={styles.subtitle}
                className="mt-1 text-xs md:text-sm text-slate-500 font-normal max-w-2xl leading-relaxed"
              >
                Nómina de colegiados habilitados, categorías federativas y
                estadísticas históricas de asistencia a reuniones técnicas.
              </Text>
            </View>

            <Button
              title="Registrar Árbitro"
              variant="primary"
              size="md"
              icon="⊕"
              onPress={() => setModalNuevoArbitro(true)}
            />
          </View>

          {/* Search & Category Filter Toolbar */}
          <View
            style={styles.filterCard}
            className="mt-5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm flex-row flex-wrap items-center justify-between gap-3"
          >
            {/* Search Input */}
            <View
              style={[
                styles.searchInputContainer,
                isMobile && { minWidth: "100%" },
              ]}
              className="flex-1 min-w-[220px] flex-row items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5"
            >
              <Text style={{ fontSize: 12, marginRight: 8 }}>🔍</Text>
              <TextInput
                placeholder="Buscar por nombre, DNI o categoría..."
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

            {/* Category Dropdown Pill */}
            <View style={{ position: "relative" }}>
              <Pressable
                onPress={() => setMenuCategoriaAbierto(!menuCategoriaAbierto)}
                style={styles.categoryDropdownBtn}
                className="flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 active:bg-slate-50"
              >
                <Text
                  style={styles.categoryDropdownText}
                  className="text-xs font-semibold text-slate-700"
                >
                  {filtroCategoria === "TODAS"
                    ? "Todas las Categorías"
                    : filtroCategoria}
                </Text>
                <Text style={{ fontSize: 12, color: "#94a3b8" }}>⌄</Text>
              </Pressable>

              {menuCategoriaAbierto && (
                <View
                  style={styles.categoryMenu}
                  className="absolute right-0 top-11 z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  {categorias.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => {
                        setFiltroCategoria(cat);
                        setMenuCategoriaAbierto(false);
                      }}
                      style={[
                        styles.categoryMenuItem,
                        filtroCategoria === cat &&
                          styles.categoryMenuItemActive,
                      ]}
                      className={`rounded-lg px-3 py-1.5 ${
                        filtroCategoria === cat
                          ? "bg-emerald-50 text-emerald-800"
                          : "active:bg-slate-50"
                      }`}
                    >
                      <Text
                        style={[
                          styles.categoryMenuItemText,
                          filtroCategoria === cat &&
                            styles.categoryMenuItemTextActive,
                        ]}
                        className={`text-xs font-bold ${
                          filtroCategoria === cat
                            ? "text-emerald-800"
                            : "text-slate-700"
                        }`}
                      >
                        {cat === "TODAS" ? "Todas las Categorías" : cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Cards Grid */}
          {loading ? (
            <View
              style={{
                paddingVertical: 80,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color="#059669" />
              <Text style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                Cargando padrón oficial...
              </Text>
            </View>
          ) : (
            <View
              style={styles.cardsGrid}
              className="mt-5 flex-row flex-wrap -mx-2"
            >
              {arbitrosFiltrados.length === 0 ? (
                <View
                  style={{
                    width: "100%",
                    paddingVertical: 64,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#64748b",
                    }}
                  >
                    No se encontraron árbitros con el filtro aplicado.
                  </Text>
                </View>
              ) : (
                arbitrosFiltrados.map((item) => (
                  <View key={item.idArbitro} style={[styles.cardCol, { width: colWidth }]}>
                    <Pressable
                      onPress={() => setArbitroSeleccionado(item)}
                      style={styles.refereeCard}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all flex-col justify-between h-full"
                    >
                      {/* Top Row: Avatar Initials + Info + Status */}
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardProfile}>
                          <View style={styles.initialsAvatar}>
                            <Text style={styles.initialsText}>
                              {getInitials(item)}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.refereeName} numberOfLines={1}>
                              {item.nombre} {item.apellido}
                            </Text>
                            <Text style={styles.refereePhone} numberOfLines={1}>
                              WhatsApp: {item.whatsapp || "No registrado"}
                            </Text>
                          </View>
                        </View>

                        <Badge
                          label="Activo"
                          variant="green"
                          size="sm"
                          rounded="md"
                          dot={true}
                        />
                      </View>

                      {/* Category Badge */}
                      <View style={{ marginTop: 12 }}>
                        <Badge
                          label={item.categoria || "COLEGIADO"}
                          variant="green"
                          size="sm"
                          rounded="md"
                        />
                      </View>

                      {/* Attendance Stats Row */}
                      <View style={styles.cardStatsSection}>
                        <View style={styles.cardStatsHeader}>
                          <Text style={styles.statsLabel}>
                            Asistencia a Sesiones:
                          </Text>
                          <Text style={styles.statsPercent}>0%</Text>
                        </View>

                        <View style={styles.statsIconsRow}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#059669",
                            }}
                          >
                            ✓ 0 P
                          </Text>
                          <Text style={{ fontSize: 12, color: "#cbd5e1" }}>
                            •
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#e11d48",
                            }}
                          >
                            ✗ 0 A
                          </Text>
                          <Text style={{ fontSize: 12, color: "#cbd5e1" }}>
                            •
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#d97706",
                            }}
                          >
                            ! 0 J
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Footer */}
          <AppFooter />
        </View>
      </ScrollView>

      {/* Modal Alta de Árbitro */}
      <NuevoArbitroModal
        visible={modalNuevoArbitro}
        onClose={() => setModalNuevoArbitro(false)}
        onCreado={() => cargarArbitros()}
      />

      {/* Modal Ficha Completa de Árbitro */}
      <AppModal
        visible={!!arbitroSeleccionado}
        onClose={() => setArbitroSeleccionado(null)}
        title={
          arbitroSeleccionado
            ? `${arbitroSeleccionado.nombre} ${arbitroSeleccionado.apellido}`
            : ""
        }
        subtitle="Ficha Técnica Individual • CIRCAJA"
        footer={
          <Button
            title="Cerrar Ficha"
            variant="outline"
            onPress={() => setArbitroSeleccionado(null)}
          />
        }
      >
        {arbitroSeleccionado && (
          <View style={{ paddingVertical: 8, gap: 10 }}>
            <View style={styles.modalRow}>
              <Text style={styles.modalRowLabel}>Categoría Oficial</Text>
              <Badge
                label={arbitroSeleccionado.categoria || "COLEGIADO"}
                variant="green"
                rounded="md"
              />
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalRowLabel}>WhatsApp</Text>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}
              >
                {arbitroSeleccionado.whatsapp || "No registrado"}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalRowLabel}>Movilidad Propia</Text>
              <Badge
                label={
                  arbitroSeleccionado.tieneAuto
                    ? "🚗 Con Automóvil"
                    : "🚶 Sin Vehículo"
                }
                variant={arbitroSeleccionado.tieneAuto ? "blue" : "gray"}
              />
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalRowLabel}>Estado en Padrón</Text>
              <Badge
                label={
                  arbitroSeleccionado.activo !== false
                    ? "Habilitado Oficial"
                    : "Inactivo"
                }
                variant={arbitroSeleccionado.activo !== false ? "green" : "red"}
                dot={true}
              />
            </View>
          </View>
        )}
      </AppModal>

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
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    minWidth: 220,
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
  categoryDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryDropdownText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  categoryMenu: {
    position: "absolute",
    right: 0,
    top: 44,
    zIndex: 50,
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 6,
  },
  categoryMenuItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryMenuItemActive: {
    backgroundColor: "#ecfdf5",
  },
  categoryMenuItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  categoryMenuItemTextActive: {
    color: "#065f46",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginTop: 20,
  },
  cardCol: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  refereeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    justifyContent: "space-between",
    minHeight: 180,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  initialsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#065f46",
  },
  refereeName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  refereePhone: {
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 2,
  },
  cardStatsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  cardStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  statsPercent: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  statsIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  modalRowLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
