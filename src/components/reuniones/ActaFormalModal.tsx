import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { GetReunionDetalleDTO } from "@/types";
import { Alert, Platform, Text, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  reunion: GetReunionDetalleDTO;
}

export function ActaFormalModal({ visible, onClose, reunion }: Props) {
  const dateFormatted = new Date(reunion.fecha).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleImprimir = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      Alert.alert(
        "Imprimir",
        "Función de impresión enviada al visor del dispositivo",
      );
    }
  };

  const presentes = reunion.asistencias.filter(
    (a) => a.estadoAsistencia === "PRESENTE",
  );
  const ausentes = reunion.asistencias.filter(
    (a) => a.estadoAsistencia === "AUSENTE",
  );
  const justificados = reunion.asistencias.filter(
    (a) => a.estadoAsistencia === "JUSTIFICADO",
  );

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Acta Oficial de Sesión Técnica"
      subtitle={`Acta N° ${reunion.idReunion} • Colegio de Árbitros`}
      footer={
        <>
          <Button title="Cerrar" variant="outline" onPress={onClose} />
          <Button
            title="🖨️ Imprimir Acta"
            variant="primary"
            onPress={handleImprimir}
          />
        </>
      }
    >
      <View className="py-2">
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 20,
          }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {/* Header del Acta */}
          <View className="items-center border-b border-slate-200 pb-4 mb-4">
            <Text className="text-base font-black tracking-wider text-slate-900 uppercase">
              COLEGIO DE ÁRBITROS DE FÚTBOL
            </Text>
            <Text className="text-xs font-semibold text-emerald-800 uppercase mt-0.5">
              CIRCAJA • ACTA DE ASAMBLEA ORDINARIA N° {reunion.idReunion}
            </Text>
            <Text className="text-[11px] text-slate-400 mt-1">
              {reunion.lugar} — {dateFormatted}
            </Text>
          </View>

          {/* Encabezado Formal */}
          <Text className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
            En la ciudad sede, siendo las{" "}
            {new Date(reunion.fecha).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            , se reúne el Colegio de Árbitros en sesión ordinaria bajo la
            presidencia y coordinación técnica, con el objeto de considerar el
            orden del día preestablecido:
          </Text>

          {/* Temas Tratados */}
          <Text className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
            1. ORDEN DEL DÍA & TEMAS TRATADOS
          </Text>
          {reunion.temas.length === 0 ? (
            <Text className="text-xs text-slate-400 italic mb-3">
              No se asentaron temas formales.
            </Text>
          ) : (
            reunion.temas.map((t, idx) => (
              <View
                key={t.idTema || idx}
                className="mb-2.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100"
              >
                <Text className="text-xs font-bold text-slate-800">
                  {idx + 1}. {t.titulo}{" "}
                  {t.tiempoMinutos ? `(${t.tiempoMinutos} min)` : ""}
                </Text>
                {t.descripcion ? (
                  <Text className="text-[11px] text-slate-600 mt-0.5">
                    {t.descripcion}
                  </Text>
                ) : null}
                {t.conclusiones ? (
                  <Text className="text-[11px] font-semibold text-emerald-800 mt-1">
                    Resolución: {t.conclusiones}
                  </Text>
                ) : null}
              </View>
            ))
          )}

          {/* Registro de Quórum */}
          <Text className="text-xs font-bold text-slate-900 uppercase tracking-wide mt-3 mb-1.5">
            2. ASISTENCIA & QUÓRUM
          </Text>
          <Text className="text-xs text-slate-700 mb-2">
            Total convocados: {reunion.asistencias.length} colegiados.
            Presentes: {presentes.length} • Ausentes: {ausentes.length} •
            Justificados: {justificados.length}.
          </Text>

          {presentes.length > 0 && (
            <View className="mb-2">
              <Text className="text-[11px] font-bold text-emerald-800 uppercase">
                Colegiados Presentes:
              </Text>
              <Text className="text-[11px] text-slate-600 mt-0.5">
                {presentes
                  .map(
                    (p) =>
                      `${p.arbitro.apellido} ${p.arbitro.nombre} (${p.arbitro.categoria || "Colegiado"})`,
                  )
                  .join(", ")}
              </Text>
            </View>
          )}

          {/* Cierre y Firmas */}
          <View className="mt-8 border-t border-slate-200 pt-6">
            <View className="flex-row justify-between pt-8">
              <View className="items-center w-1/3">
                <View className="w-full border-t border-slate-400 mb-1" />
                <Text className="text-[10px] font-bold text-slate-700">
                  Firma Secretario
                </Text>
                <Text className="text-[9px] text-slate-400">
                  Colegio de Árbitros
                </Text>
              </View>
              <View className="items-center w-1/3">
                <View className="w-full border-t border-slate-400 mb-1" />
                <Text className="text-[10px] font-bold text-slate-700">
                  Firma Presidente
                </Text>
                <Text className="text-[9px] text-slate-400">
                  Comisión Directiva
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </AppModal>
  );
}
