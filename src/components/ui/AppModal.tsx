import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
}

export function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollable = true,
}: AppModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // En pantallas chicas o landscape, limitamos dinámicamente la altura máxima
  const maxModalHeight = Math.min(
    windowHeight * 0.85,
    windowHeight - insets.top - insets.bottom - 40
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}>
          {/* Backdrop clickable que oscurece el fondo */}
          <Pressable
            onPress={onClose}
            style={styles.backdrop}
          />

          {/* Modal Window: FONDO BLANCO PURO SÓLIDO (#ffffff), CENTRADO */}
          <View
            style={[
              styles.modalCard,
              {
                maxHeight: maxModalHeight,
                maxWidth: Math.min(windowWidth - 32, 540),
              },
            ]}
            className="w-full rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 z-10 flex-col">
            {/* Header */}
            <View style={styles.headerRow} className="flex-row items-start justify-between border-b border-slate-100 pb-3 mb-3">
              <View style={styles.headerTextWrapper}>
                <Text style={styles.headerTitle} className="text-lg font-bold text-slate-900" numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.headerSubtitle} className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={styles.closeBtn}
                className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200">
                <Text style={styles.closeBtnText} className="text-slate-500 font-bold text-sm">✕</Text>
              </Pressable>
            </View>

            {/* Content scrolleable para no desbordar en pantallas pequeñas */}
            {scrollable ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 8 }}>
                {children}
              </ScrollView>
            ) : (
              <View style={{ flex: 1, minHeight: 0 }}>
                {children}
              </View>
            )}

            {/* Footer actions */}
            {footer ? (
              <View style={styles.footerRow} className="border-t border-slate-100 pt-3 mt-2 flex-row justify-end gap-2">
                {footer}
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed' as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex' as any,
        }
      : {}),
  },
  keyboardContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff', // FONDO BLANCO SÓLIDO
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
    ...(Platform.OS === 'web'
      ? {
          margin: 'auto' as any,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }
      : {}),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 8,
  },
});
