import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReunionesService, ArbitrosService } from '@/services/api';
import {
  EstadoAsistencia,
  GetArbitroDTO,
  GetAsistenciaDTO,
  GetDisponibilidadFinDeSemanaDTO,
  GetReunionDetalleDTO,
  RegistrarAsistenciaBatchDTO,
  TemaReunionDTO,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TemasManager } from '@/components/reuniones/TemasManager';
import { DisponibilidadReporte } from '@/components/reuniones/DisponibilidadReporte';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { IncorporarArbitrosModal } from '@/components/reuniones/IncorporarArbitrosModal';
import { ActaFormalModal } from '@/components/reuniones/ActaFormalModal';
import { LoginModal } from '@/components/auth/LoginModal';

type TabType = 'asistencia' | 'temas' | 'disponibilidad' | 'acta';

export default function DetalleReunionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<TabType>('asistencia');
  const [reunion, setReunion] = useState<GetReunionDetalleDTO | null>(null);
  const [reporteFinde, setReporteFinde] = useState<GetDisponibilidadFinDeSemanaDTO | null>(null);
  const [todosArbitros, setTodosArbitros] = useState<GetArbitroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardandoAsistencias, setGuardandoAsistencias] = useState(false);

  // Filtros internos de la planilla
  const [busquedaArbitro, setBusquedaArbitro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroAsistencia, setFiltroAsistencia] = useState<'TODOS' | 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'>('TODOS');
  const [menuCategoriaAbierto, setMenuCategoriaAbierto] = useState(false);

  // Búsqueda rápida superior para incorporación instantánea
  const [busquedaRapida, setBusquedaRapida] = useState('');

  // Modales
  const [modalPadronVisible, setModalPadronVisible] = useState(false);
  const [modalActaVisible, setModalActaVisible] = useState(false);
  const [modalLogin, setModalLogin] = useState(false);

  // Local state for attendance to allow editing before batch save
  const [asistenciasLocales, setAsistenciasLocales] = useState<GetAsistenciaDTO[]>([]);

  const idNum = parseInt(id as string, 10);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [data, rep, resArb] = await Promise.all([
        ReunionesService.obtenerDetalle(idNum),
        ReunionesService.obtenerDisponibilidadFinde(idNum),
        ArbitrosService.listar(0, 100),
      ]);
      setReunion(data);
      setAsistenciasLocales(data.asistencias || []);
      setReporteFinde(rep);
      setTodosArbitros(resArb.content || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cargar la reunión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idNum) {
      cargarDatos();
    }
  }, [idNum]);

  // Modificar asistencia individual en estado local
  const handleChangeEstado = (index: number, nuevoEstado: EstadoAsistencia) => {
    const copia = [...asistenciasLocales];
    copia[index] = { ...copia[index], estadoAsistencia: nuevoEstado };
    setAsistenciasLocales(copia);
  };

  const handleToggleSabado = (index: number) => {
    const copia = [...asistenciasLocales];
    copia[index] = { ...copia[index], disponibleSabado: !copia[index].disponibleSabado };
    setAsistenciasLocales(copia);
  };

  const handleToggleDomingo = (index: number) => {
    const copia = [...asistenciasLocales];
    copia[index] = { ...copia[index], disponibleDomingo: !copia[index].disponibleDomingo };
    setAsistenciasLocales(copia);
  };

  const handleChangeObservacion = (index: number, obs: string) => {
    const copia = [...asistenciasLocales];
    copia[index] = { ...copia[index], observacion: obs };
    setAsistenciasLocales(copia);
  };

  // Pase masivo
  const handleTodosPresentes = () => {
    const actualizadas = asistenciasLocales.map((a) => ({
      ...a,
      estadoAsistencia: 'PRESENTE' as const,
    }));
    setAsistenciasLocales(actualizadas);
  };

  const handleTodosAusentes = () => {
    const actualizadas = asistenciasLocales.map((a) => ({
      ...a,
      estadoAsistencia: 'AUSENTE' as const,
    }));
    setAsistenciasLocales(actualizadas);
  };

  // Guardar asistencias en lote (POST /reuniones/{id}/asistencia)
  const handleGuardarAsistencias = async (datosAGuardar = asistenciasLocales) => {
    try {
      setGuardandoAsistencias(true);
      const payload: RegistrarAsistenciaBatchDTO = {
        sincronizarConActivos: false,
        asistencias: datosAGuardar.map((a) => ({
          idAsistencia: a.idAsistencia,
          idArbitro: a.arbitro.idArbitro,
          estadoAsistencia: a.estadoAsistencia,
          observacion: a.observacion,
          disponibleSabado: a.disponibleSabado,
          disponibleDomingo: a.disponibleDomingo,
        })),
      };

      const updated = await ReunionesService.registrarAsistencia(idNum, payload);
      setReunion(updated);
      setAsistenciasLocales(updated.asistencias);

      const rep = await ReunionesService.obtenerDisponibilidadFinde(idNum);
      setReporteFinde(rep);

      Alert.alert('Éxito', 'Planilla de asistencia guardada correctamente');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar asistencias');
    } finally {
      setGuardandoAsistencias(false);
    }
  };

  // Incorporar árbitros desde el padrón
  const handleAgregarArbitros = (arbitrosNuevos: GetArbitroDTO[]) => {
    const nuevasAsistencias: GetAsistenciaDTO[] = arbitrosNuevos.map((arb) => ({
      idAsistencia: Date.now() + arb.idArbitro,
      arbitro: arb,
      estadoAsistencia: 'AUSENTE',
      disponibleSabado: false,
      disponibleDomingo: false,
    }));

    const listaActualizada = [...asistenciasLocales, ...nuevasAsistencias];
    setAsistenciasLocales(listaActualizada);
    handleGuardarAsistencias(listaActualizada);
  };

  const handleIncorporarRapido = (arbitro: GetArbitroDTO) => {
    handleAgregarArbitros([arbitro]);
    setBusquedaRapida('');
  };

  const handleGuardarTemas = async (nuevosTemas: TemaReunionDTO[]) => {
    try {
      const updated = await ReunionesService.actualizarTemas(idNum, nuevosTemas);
      setReunion(updated);
      Alert.alert('Éxito', 'Orden del día actualizado');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar temas');
    }
  };

  const handleCerrarActa = () => {
    Alert.alert(
      'Cerrar Acta (Finalizar)',
      '¿Deseas cerrar y finalizar formalmente esta sesión? El acta quedará asentada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Acta',
          style: 'destructive',
          onPress: async () => {
            await handleGuardarAsistencias();
            Alert.alert('Acta Finalizada', 'La sesión técnica ha sido cerrada oficialmente.');
          },
        },
      ]
    );
  };

  const categorias = useMemo(() => {
    const set = new Set<string>();
    asistenciasLocales.forEach((a) => {
      if (a.arbitro.categoria) set.add(a.arbitro.categoria);
    });
    return ['TODAS', ...Array.from(set)];
  }, [asistenciasLocales]);

  const asistenciasFiltradas = useMemo(() => {
    return asistenciasLocales.filter((a) => {
      const matchTexto =
        `${a.arbitro.nombre} ${a.arbitro.apellido} ${a.arbitro.categoria || ''} ${a.observacion || ''}`
          .toLowerCase()
          .includes(busquedaArbitro.toLowerCase());

      const matchCat =
        filtroCategoria === 'TODAS' || a.arbitro.categoria === filtroCategoria;

      const matchEstado =
        filtroAsistencia === 'TODOS' || a.estadoAsistencia === filtroAsistencia;

      return matchTexto && matchCat && matchEstado;
    });
  }, [asistenciasLocales, busquedaArbitro, filtroCategoria, filtroAsistencia]);

  const convocadosIds = useMemo(() => {
    return new Set(asistenciasLocales.map((a) => a.arbitro.idArbitro));
  }, [asistenciasLocales]);

  const pendientesPadron = useMemo(() => {
    return todosArbitros.filter((a) => !convocadosIds.has(a.idArbitro));
  }, [todosArbitros, convocadosIds]);

  const sugerenciasRapidas = useMemo(() => {
    if (!busquedaRapida.trim()) return [];
    return pendientesPadron
      .filter((a) =>
        `${a.nombre} ${a.apellido} ${a.categoria || ''}`
          .toLowerCase()
          .includes(busquedaRapida.toLowerCase())
      )
      .slice(0, 5);
  }, [pendientesPadron, busquedaRapida]);

  if (loading || !reunion) {
    return (
      <View
        style={{ flex: 1, paddingTop: insets.top }}
        className="items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ marginTop: 12, fontSize: 12, color: '#64748b', fontWeight: '500' }}>Cargando reunión técnica...</Text>
      </View>
    );
  }

  const presentesCount = asistenciasLocales.filter((a) => a.estadoAsistencia === 'PRESENTE').length;
  const ausentesCount = asistenciasLocales.filter((a) => a.estadoAsistencia === 'AUSENTE').length;
  const justificadosCount = asistenciasLocales.filter((a) => a.estadoAsistencia === 'JUSTIFICADO').length;
  const totalConvocados = asistenciasLocales.length;
  const quorumPercent = totalConvocados > 0 ? Math.round((presentesCount / totalConvocados) * 100) : 0;

  const formattedDate = new Date(reunion.fecha).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const getInitials = (item: GetArbitroDTO) => {
    const fn = (item.nombre || '').charAt(0);
    const ln = (item.apellido || '').charAt(0);
    return `${fn}${ln}`.toUpperCase() || 'AR';
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <AppHeader
        onLogin={() => setModalLogin(true)}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}>
        <View style={styles.contentContainer}>
          {/* Top Action Bar */}
          <View style={styles.topActionBar}>
            <Pressable
              onPress={() => router.push('/')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155' }}>← Volver a Reuniones</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Button
                title="Imprimir Acta"
                variant="outline"
                size="sm"
                icon="🖨️"
                onPress={() => setModalActaVisible(true)}
              />
              <Button
                title="Cerrar Acta (Finalizar)"
                variant="dark"
                size="sm"
                icon="✓"
                onPress={handleCerrarActa}
              />
            </View>
          </View>

          {/* Meeting Header Banner */}
          <View style={[styles.bannerCard, { flexDirection: isMobile ? 'column' : 'row' }]}>
            {/* Left Info */}
            <View style={{ flex: 1, minWidth: isMobile ? '100%' : 300 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Badge
                  label="En Curso"
                  variant="green"
                  size="sm"
                  rounded="full"
                  dot={true}
                />
                <Badge
                  label="Colegio de Árbitros • Sesión Ordinaria"
                  variant="green"
                  size="sm"
                  rounded="full"
                />
              </View>

              <Text style={styles.bannerTitle}>
                {reunion.titulo}
              </Text>

              <View style={styles.bannerMetaRow}>
                <Text style={styles.metaItem}>📅 {formattedDate}</Text>
                <Text style={styles.metaItem}>📍 {reunion.lugar}</Text>
                <Text style={styles.metaItem}>👥 {totalConvocados} convocados</Text>
              </View>

              {reunion.observaciones ? (
                <Text style={styles.directiveBox}>
                  <Text style={{ fontWeight: '800', color: '#0f172a' }}>Directiva / Observación: </Text>
                  {reunion.observaciones}
                </Text>
              ) : null}
            </View>

            {/* Right Quorum Box */}
            <View style={[styles.quorumCard, { width: isMobile ? '100%' : 290 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.quorumTitle}>
                  CONTROL DE QUÓRUM
                </Text>
                <Badge
                  label={`${quorumPercent}% Asistencia`}
                  variant="green"
                  size="sm"
                  rounded="md"
                />
              </View>

              {/* 3 Metrics */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={[styles.quorumStatBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <Text style={[styles.quorumStatNumber, { color: '#065f46' }]}>
                    {presentesCount}
                  </Text>
                  <Text style={[styles.quorumStatLabel, { color: '#047857' }]}>
                    PRESENTES
                  </Text>
                </View>

                <View style={[styles.quorumStatBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <Text style={[styles.quorumStatNumber, { color: '#9f1239' }]}>
                    {ausentesCount}
                  </Text>
                  <Text style={[styles.quorumStatLabel, { color: '#be123c' }]}>
                    AUSENTES
                  </Text>
                </View>

                <View style={[styles.quorumStatBox, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
                  <Text style={[styles.quorumStatNumber, { color: '#92400e' }]}>
                    {justificadosCount}
                  </Text>
                  <Text style={[styles.quorumStatLabel, { color: '#b45309' }]}>
                    JUSTIF.
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[styles.progressBarFill, { width: `${quorumPercent}%` }]}
                />
              </View>
            </View>
          </View>

          {/* Subtabs Navigation Horizontal ScrollView */}
          <View style={styles.subtabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subtabsScroll}>
              <Pressable
                onPress={() => setActiveTab('asistencia')}
                style={[
                  styles.subtabBtn,
                  activeTab === 'asistencia' ? styles.subtabBtnActive : styles.subtabBtnInactive,
                ]}>
                <Text style={{ fontSize: 12, color: activeTab === 'asistencia' ? '#ffffff' : '#64748b' }}>
                  ✓
                </Text>
                <Text
                  style={[
                    styles.subtabText,
                    { color: activeTab === 'asistencia' ? '#ffffff' : '#334155' },
                  ]}>
                  Planilla de Asistencia & Observaciones
                </Text>
                <View
                  style={[
                    styles.subtabCountPill,
                    { backgroundColor: activeTab === 'asistencia' ? '#065f46' : '#f1f5f9' },
                  ]}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '900',
                      color: activeTab === 'asistencia' ? '#ffffff' : '#475569',
                    }}>
                    {presentesCount}/{totalConvocados}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('temas')}
                style={[
                  styles.subtabBtn,
                  activeTab === 'temas' ? styles.subtabBtnActive : styles.subtabBtnInactive,
                ]}>
                <Text style={{ fontSize: 12, color: activeTab === 'temas' ? '#ffffff' : '#64748b' }}>
                  📄
                </Text>
                <Text
                  style={[
                    styles.subtabText,
                    { color: activeTab === 'temas' ? '#ffffff' : '#334155' },
                  ]}>
                  Temas Tratados (Orden del Día)
                </Text>
                <View
                  style={[
                    styles.subtabCountPill,
                    { backgroundColor: activeTab === 'temas' ? '#065f46' : '#f1f5f9' },
                  ]}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '900',
                      color: activeTab === 'temas' ? '#ffffff' : '#475569',
                    }}>
                    {reunion.temas.length}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab('disponibilidad')}
                style={[
                  styles.subtabBtn,
                  activeTab === 'disponibilidad' ? styles.subtabBtnActive : styles.subtabBtnInactive,
                ]}>
                <Text style={{ fontSize: 12, color: activeTab === 'disponibilidad' ? '#ffffff' : '#64748b' }}>
                  📄
                </Text>
                <Text
                  style={[
                    styles.subtabText,
                    { color: activeTab === 'disponibilidad' ? '#ffffff' : '#334155' },
                  ]}>
                  Disponibilidad Finde (Designador)
                </Text>
                <View
                  style={[
                    styles.subtabCountPill,
                    { backgroundColor: activeTab === 'disponibilidad' ? '#065f46' : '#ecfdf5' },
                  ]}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '900',
                      color: activeTab === 'disponibilidad' ? '#ffffff' : '#047857',
                    }}>
                    {reporteFinde?.totalDisponiblesAmbosDias || 0} full
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setModalActaVisible(true)}
                style={styles.subtabBtnInactive}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>📄</Text>
                <Text style={[styles.subtabText, { color: '#334155' }]}>
                  Acta Oficial Formal
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Subtab 1: Asistencia */}
          {activeTab === 'asistencia' && (
            <View>
              {/* Highlight Card: Registrar / Incorporar Árbitros */}
              <View style={styles.highlightCard}>
                <View style={[styles.highlightRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                  <View style={{ flex: 1, minWidth: isMobile ? '100%' : 260 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' }} />
                      <Text style={styles.highlightTag}>
                        INGRESO A SALA • Padrón Oficial del Colegio
                      </Text>
                    </View>
                    <Text style={styles.highlightTitle}>
                      Registrar / Incorporar Árbitros
                    </Text>
                    <Text style={styles.highlightSubtitle}>
                      Agrega a los colegiados a medida que ingresan al salón o abre el padrón para convocatorias selectivas.
                    </Text>
                  </View>

                  <View style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: 8, position: 'relative' }}>
                    <View style={[styles.quickSearchInputWrapper, { width: isMobile ? '100%' : 220 }]}>
                      <Text style={{ fontSize: 12, marginRight: 8, color: '#94a3b8' }}>🔍</Text>
                      <TextInput
                        placeholder="Buscar árbitro para agregar..."
                        placeholderTextColor="#94a3b8"
                        value={busquedaRapida}
                        onChangeText={setBusquedaRapida}
                        style={styles.quickSearchTextInput}
                      />
                    </View>

                    <Button
                      title={`Ver Padrón (${pendientesPadron.length} pendientes)`}
                      variant="primary"
                      size="sm"
                      icon="⊕"
                      onPress={() => setModalPadronVisible(true)}
                    />

                    {/* Dropdown sugerencias rápidas */}
                    {sugerenciasRapidas.length > 0 && (
                      <View style={styles.quickDropdownMenu}>
                        {sugerenciasRapidas.map((arb) => (
                          <Pressable
                            key={arb.idArbitro}
                            onPress={() => handleIncorporarRapido(arb)}
                            style={styles.quickDropdownItem}>
                            <View>
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>
                                {arb.nombre} {arb.apellido}
                              </Text>
                              <Text style={{ fontSize: 10, color: '#64748b' }}>
                                {arb.categoria}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 12, color: '#059669', fontWeight: '800' }}>+ Agregar</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Table / Toolbar Filter Controls */}
              <View style={styles.toolbarCard}>
                {/* Search & Category */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: isMobile ? '100%' : 220 }}>
                  <View style={styles.toolbarSearchInput}>
                    <Text style={{ fontSize: 12, marginRight: 8, color: '#94a3b8' }}>🔍</Text>
                    <TextInput
                      placeholder="Buscar árbitro..."
                      placeholderTextColor="#94a3b8"
                      value={busquedaArbitro}
                      onChangeText={setBusquedaArbitro}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={{ position: 'relative' }}>
                    <Pressable
                      onPress={() => setMenuCategoriaAbierto(!menuCategoriaAbierto)}
                      style={styles.toolbarCategoryBtn}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                        {filtroCategoria === 'TODAS' ? 'Categorías' : filtroCategoria}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8' }}>⌄</Text>
                    </Pressable>

                    {menuCategoriaAbierto && (
                      <View style={styles.toolbarCategoryMenu}>
                        {categorias.map((c) => (
                          <Pressable
                            key={c}
                            onPress={() => {
                              setFiltroCategoria(c);
                              setMenuCategoriaAbierto(false);
                            }}
                            style={{ padding: 8, borderRadius: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1e293b' }}>
                              {c === 'TODAS' ? 'Todas las categorías' : c}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Filter Status Pills in Horizontal ScrollView */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pressable
                    onPress={() => setFiltroAsistencia('TODOS')}
                    style={[
                      styles.filterPill,
                      filtroAsistencia === 'TODOS' && styles.filterPillActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterPillText,
                        filtroAsistencia === 'TODOS' && styles.filterPillTextActive,
                      ]}>
                      Todos ({totalConvocados})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFiltroAsistencia('PRESENTE')}
                    style={[
                      styles.statusFilterPill,
                      filtroAsistencia === 'PRESENTE'
                        ? { backgroundColor: '#059669', borderColor: '#059669' }
                        : { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
                    ]}>
                    <View style={[styles.dotPill, { backgroundColor: filtroAsistencia === 'PRESENTE' ? '#ffffff' : '#059669' }]} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: filtroAsistencia === 'PRESENTE' ? '#ffffff' : '#065f46',
                      }}>
                      Presentes ({presentesCount})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFiltroAsistencia('AUSENTE')}
                    style={[
                      styles.statusFilterPill,
                      filtroAsistencia === 'AUSENTE'
                        ? { backgroundColor: '#e11d48', borderColor: '#e11d48' }
                        : { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
                    ]}>
                    <View style={[styles.dotPill, { backgroundColor: filtroAsistencia === 'AUSENTE' ? '#ffffff' : '#e11d48' }]} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: filtroAsistencia === 'AUSENTE' ? '#ffffff' : '#9f1239',
                      }}>
                      Ausentes ({ausentesCount})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFiltroAsistencia('JUSTIFICADO')}
                    style={[
                      styles.statusFilterPill,
                      filtroAsistencia === 'JUSTIFICADO'
                        ? { backgroundColor: '#d97706', borderColor: '#d97706' }
                        : { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
                    ]}>
                    <View style={[styles.dotPill, { backgroundColor: filtroAsistencia === 'JUSTIFICADO' ? '#ffffff' : '#d97706' }]} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: filtroAsistencia === 'JUSTIFICADO' ? '#ffffff' : '#92400e',
                      }}>
                      Justificados ({justificadosCount})
                    </Text>
                  </Pressable>
                </ScrollView>

                {/* Quick actions & Save button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Button
                      title="Todos P"
                      variant="subtle-green"
                      size="sm"
                      onPress={handleTodosPresentes}
                    />
                    <Button
                      title="Todos A"
                      variant="subtle-red"
                      size="sm"
                      onPress={handleTodosAusentes}
                    />
                  </View>
                  <Button
                    title="Guardar en Servidor"
                    variant="primary"
                    size="sm"
                    icon="💾"
                    loading={guardandoAsistencias}
                    onPress={() => handleGuardarAsistencias()}
                  />
                </View>
              </View>

              {/* Attendance Table wrapped in Horizontal ScrollView */}
              <View style={styles.tableCard}>
                {totalConvocados === 0 ? (
                  /* Empty State */
                  <View style={styles.emptyTableState}>
                    <View style={styles.emptyUserCircle}>
                      <Text style={{ fontSize: 24 }}>👤</Text>
                    </View>
                    <Text style={styles.emptyTableTitle}>
                      No hay árbitros registrados en la planilla de esta sesión.
                    </Text>
                    <Text style={styles.emptyTableSubtitle}>
                      Podes ir incorporando árbitros uno a uno usando el buscador rápido superior o abriendo el padrón general.
                    </Text>
                    <Button
                      title="Abrir Padrón para Agregar"
                      variant="primary"
                      size="md"
                      icon="⊕"
                      style={{ marginTop: 16 }}
                      onPress={() => setModalPadronVisible(true)}
                    />
                  </View>
                ) : (
                  /* Horizontal Scrollable Table with guaranteed minWidth */
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    nestedScrollEnabled={true}>
                    <View style={{ minWidth: 740, width: '100%' }}>
                      {/* 4 Columns Header */}
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableColHeader, { width: 240 }]}>
                          ÁRBITRO / COLEGIADO
                        </Text>
                        <Text style={[styles.tableColHeader, { width: 220 }]}>
                          PASE DE LISTA (1-CLICK)
                        </Text>
                        <Text style={[styles.tableColHeader, { width: 170 }]}>
                          OBSERVACIÓN CORRESPONDIENTE
                        </Text>
                        <Text style={[styles.tableColHeader, { width: 110, textAlign: 'right' }]}>
                          DISPONIBILIDAD
                        </Text>
                      </View>

                      {/* Table Rows */}
                      {asistenciasFiltradas.map((item) => {
                        const originalIdx = asistenciasLocales.findIndex(
                          (a) => a.arbitro.idArbitro === item.arbitro.idArbitro
                        );

                        return (
                          <View
                            key={item.arbitro.idArbitro}
                            style={styles.tableRow}>
                            {/* Col 1: Árbitro */}
                            <View style={[styles.colArbitro, { width: 240 }]}>
                              <View style={styles.refereeInitialsBadge}>
                                <Text style={styles.refereeInitialsText}>
                                  {getInitials(item.arbitro)}
                                </Text>
                              </View>
                              <View style={{ flex: 1, paddingRight: 6 }}>
                                <Text style={styles.refereeRowName} numberOfLines={1}>
                                  {item.arbitro.nombre} {item.arbitro.apellido}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                  <Badge label={item.arbitro.categoria || 'COLEGIADO'} variant="green" size="sm" rounded="md" />
                                  {item.arbitro.tieneAuto ? (
                                    <Text style={{ fontSize: 10, color: '#94a3b8' }}>🚗 Auto</Text>
                                  ) : null}
                                </View>
                              </View>
                            </View>

                            {/* Col 2: 1-Click Buttons */}
                            <View style={[styles.colButtons, { width: 220 }]}>
                              <Pressable
                                onPress={() => handleChangeEstado(originalIdx, 'PRESENTE')}
                                style={[
                                  styles.stateBtn,
                                  item.estadoAsistencia === 'PRESENTE'
                                    ? { backgroundColor: '#059669', borderColor: '#059669' }
                                    : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                                ]}>
                                <Text
                                  style={[
                                    styles.stateBtnText,
                                    { color: item.estadoAsistencia === 'PRESENTE' ? '#ffffff' : '#475569' },
                                  ]}>
                                  Presente
                                </Text>
                              </Pressable>

                              <Pressable
                                onPress={() => handleChangeEstado(originalIdx, 'AUSENTE')}
                                style={[
                                  styles.stateBtn,
                                  item.estadoAsistencia === 'AUSENTE'
                                    ? { backgroundColor: '#e11d48', borderColor: '#e11d48' }
                                    : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                                ]}>
                                <Text
                                  style={[
                                    styles.stateBtnText,
                                    { color: item.estadoAsistencia === 'AUSENTE' ? '#ffffff' : '#475569' },
                                  ]}>
                                  Ausente
                                </Text>
                              </Pressable>

                              <Pressable
                                onPress={() => handleChangeEstado(originalIdx, 'JUSTIFICADO')}
                                style={[
                                  styles.stateBtn,
                                  item.estadoAsistencia === 'JUSTIFICADO'
                                    ? { backgroundColor: '#d97706', borderColor: '#d97706' }
                                    : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                                ]}>
                                <Text
                                  style={[
                                    styles.stateBtnText,
                                    { color: item.estadoAsistencia === 'JUSTIFICADO' ? '#ffffff' : '#475569' },
                                  ]}>
                                  Justif.
                                </Text>
                              </Pressable>
                            </View>

                            {/* Col 3: Observación Inline */}
                            <View style={[styles.colObs, { width: 170 }]}>
                              <TextInput
                                placeholder="Observación..."
                                placeholderTextColor="#94a3b8"
                                value={item.observacion || ''}
                                onChangeText={(obs) => handleChangeObservacion(originalIdx, obs)}
                                style={styles.obsTextInput}
                              />
                            </View>

                            {/* Col 4: Disponibilidad Finde Toggles */}
                            <View style={[styles.colFinde, { width: 110 }]}>
                              <Pressable
                                onPress={() => handleToggleSabado(originalIdx)}
                                style={[
                                  styles.dayToggleBtn,
                                  item.disponibleSabado
                                    ? { borderColor: '#10b981', backgroundColor: '#ecfdf5' }
                                    : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
                                ]}>
                                <Text
                                  style={[
                                    styles.dayToggleText,
                                    { color: item.disponibleSabado ? '#065f46' : '#94a3b8' },
                                  ]}>
                                  {item.disponibleSabado ? '✓ S' : '✗ S'}
                                </Text>
                              </Pressable>

                              <Pressable
                                onPress={() => handleToggleDomingo(originalIdx)}
                                style={[
                                  styles.dayToggleBtn,
                                  item.disponibleDomingo
                                    ? { borderColor: '#10b981', backgroundColor: '#ecfdf5' }
                                    : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
                                ]}>
                                <Text
                                  style={[
                                    styles.dayToggleText,
                                    { color: item.disponibleDomingo ? '#065f46' : '#94a3b8' },
                                  ]}>
                                  {item.disponibleDomingo ? '✓ D' : '✗ D'}
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          {/* Subtab 2: Temas Tratados */}
          {activeTab === 'temas' && (
            <View style={styles.whiteSectionCard}>
              <TemasManager
                temas={reunion.temas}
                onGuardarTemas={handleGuardarTemas}
                editable={reunion.editable !== false}
              />
            </View>
          )}

          {/* Subtab 3: Reporte Finde */}
          {activeTab === 'disponibilidad' && reporteFinde && (
            <View style={{ marginBottom: 24 }}>
              <DisponibilidadReporte reporte={reporteFinde} />
            </View>
          )}

          {/* Subtab 4: Acta Oficial */}
          {activeTab === 'acta' && (
            <View style={{ marginBottom: 24 }}>
              <ActaFormalModal
                visible={true}
                onClose={() => setActiveTab('asistencia')}
                reunion={reunion}
              />
            </View>
          )}

          {/* Footer */}
          <AppFooter />
        </View>
      </ScrollView>

      {/* Modal Padrón para Convocatoria */}
      <IncorporarArbitrosModal
        visible={modalPadronVisible}
        onClose={() => setModalPadronVisible(false)}
        todosArbitros={todosArbitros}
        asistenciasActuales={asistenciasLocales}
        onAgregarArbitros={handleAgregarArbitros}
      />

      {/* Modal Acta Formal */}
      <ActaFormalModal
        visible={modalActaVisible}
        onClose={() => setModalActaVisible(false)}
        reunion={reunion}
      />

      {/* Modal Login */}
      <LoginModal
        visible={modalLogin}
        onClose={() => setModalLogin(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1280,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
  },
  topActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  bannerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    marginBottom: 18,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  bannerMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  directiveBox: {
    marginTop: 12,
    fontSize: 12,
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    lineHeight: 18,
  },
  quorumCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  quorumTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 1,
  },
  quorumStatBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  quorumStatNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  quorumStatLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressBarTrack: {
    marginTop: 12,
    height: 6,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 9999,
  },
  subtabsWrapper: {
    width: '100%',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  subtabsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  subtabBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  subtabBtnInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  subtabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtabCountPill: {
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },
  highlightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#f0fdf4',
    padding: 16,
    marginBottom: 16,
  },
  highlightRow: {
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 12,
  },
  highlightTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065f46',
    letterSpacing: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  highlightSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  quickSearchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickSearchTextInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    padding: 0,
  },
  quickDropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 44,
    zIndex: 50,
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 6,
  },
  quickDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
  },
  toolbarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toolbarSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    padding: 0,
  },
  toolbarCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolbarCategoryMenu: {
    position: 'absolute',
    left: 0,
    top: 40,
    zIndex: 50,
    minWidth: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: '#0f172a',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  statusFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dotPill: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  emptyTableState: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyUserCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTableTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptyTableSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 420,
    marginTop: 4,
    lineHeight: 18,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  colArbitro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refereeInitialsBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refereeInitialsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065f46',
  },
  refereeRowName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  colButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stateBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  colObs: {
    paddingRight: 10,
  },
  obsTextInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    color: '#1e293b',
  },
  colFinde: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dayToggleBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dayToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  whiteSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 24,
  },
});
