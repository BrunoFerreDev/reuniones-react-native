import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePathname, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
  onNuevaReunion?: () => void;
  onLogin?: () => void;
  reunionesCount?: number;
  userPhone?: string;
}

export function AppHeader({
  onNuevaReunion,
  onLogin,
  reunionesCount,
  userPhone,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 680;

  const isReuniones = pathname === "/" || pathname.startsWith("/reunion");
  const isArbitros = pathname.startsWith("/arbitros");

  return (
    <View
      style={[
        styles.headerWrapper,
        {
          paddingTop: Math.max(insets.top, 8),
          paddingLeft: Math.max(insets.left, 12),
          paddingRight: Math.max(insets.right, 12),
        },
      ]}
    >
      <View style={styles.headerContainer}>
        {/* Brand Left */}
        <Pressable onPress={() => router.push("/")} style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 15 }}>🛡️</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>CIRCAJA</Text>
              <Badge
                label="ÁRBITROS"
                variant="green"
                size="sm"
                rounded="full"
              />
            </View>
            <Text style={styles.brandSubtitle}>
              Actas Técnicas & Control de Asistencias
            </Text>
          </View>
        </Pressable>

        {/* Right Actions: Phone + Logout + Nueva (on wide screens) */}
        {!isSmallScreen && (
          <View style={styles.navTabsRow}>
            <Pressable
              onPress={() => router.push("/")}
              style={[
                styles.navTab,
                isReuniones ? styles.navTabActive : styles.navTabInactive,
              ]}
            >
              <Text style={{ fontSize: 12 }}>📅</Text>
              <Text
                style={[
                  styles.navTabText,
                  { color: isReuniones ? "#065f46" : "#475569" },
                ]}
              >
                Reuniones
              </Text>
              {typeof reunionesCount === "number" && (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{reunionesCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/arbitros")}
              style={[
                styles.navTab,
                isArbitros ? styles.navTabActive : styles.navTabInactive,
              ]}
            >
              <Text style={{ fontSize: 12 }}>👥</Text>
              <Text
                style={[
                  styles.navTabText,
                  { color: isArbitros ? "#065f46" : "#475569" },
                ]}
              >
                Padrón
              </Text>
            </Pressable>
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.rightActionsRow}>
          {/* {onNuevaReunion && !isSmallScreen && (
            <Button
              title="Nueva Reunión"
              variant="primary"
              size="sm"
              icon="⊕"
              onPress={onNuevaReunion}
            />
          )} */}

          <Pressable onPress={onLogin} style={styles.userPill}>
            <Text style={{ fontSize: 11 }}>👤</Text>
            <Text style={styles.userPhoneText} numberOfLines={1}>
              {userPhone
                ? isSmallScreen
                  ? userPhone.slice(0, 10) + "..."
                  : userPhone
                : "Ingresar"}
            </Text>
          </Pressable>

          <Pressable onPress={onLogin} hitSlop={8} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>↳</Text>
          </Pressable>
        </View>
      </View>

      {/* Mobile Horizontal Tabs Bar */}
      {isSmallScreen && (
        <View style={styles.mobileTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileTabsScroll}
          >
            <Pressable
              onPress={() => router.push("/")}
              style={[
                styles.navTab,
                isReuniones ? styles.navTabActive : styles.navTabInactive,
              ]}
            >
              <Text style={{ fontSize: 12 }}>📅</Text>
              <Text
                style={[
                  styles.navTabText,
                  { color: isReuniones ? "#065f46" : "#475569" },
                ]}
              >
                Reuniones
              </Text>
              {typeof reunionesCount === "number" && (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{reunionesCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/arbitros")}
              style={[
                styles.navTab,
                isArbitros ? styles.navTabActive : styles.navTabInactive,
              ]}
            >
              <Text style={{ fontSize: 12 }}>👥</Text>
              <Text
                style={[
                  styles.navTabText,
                  { color: isArbitros ? "#065f46" : "#475569" },
                ]}
              >
                Padrón
              </Text>
            </Pressable>

            {onNuevaReunion && (
              <Button
                title="Nueva Reunión"
                variant="primary"
                size="sm"
                icon="⊕"
                onPress={onNuevaReunion}
              />
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    zIndex: 30,
    paddingBottom: 8,
  },
  headerContainer: {
    width: "100%",
    maxWidth: 1280,
    marginHorizontal: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "500",
  },
  navTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  navTabActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  navTabInactive: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  navTabText: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 55,
  },
  countPill: {
    backgroundColor: "#047857",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 2,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  userPhoneText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
  },
  mobileTabsContainer: {
    width: "100%",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 4,
  },
  mobileTabsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
