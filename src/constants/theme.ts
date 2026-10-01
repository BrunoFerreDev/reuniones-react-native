/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0f172a",
    background: "#f8fafc",
    backgroundElement: "#ffffff",
    backgroundSelected: "#ecfdf5",
    textSecondary: "#64748b",
    primary: "#059669",
    primaryHover: "#047857",
    primaryLight: "#ecfdf5",
    primaryBorder: "#a7f3d0",
    border: "#e2e8f0",
  },
  dark: {
    text: "#f8fafc",
    background: "#0f172a",
    backgroundElement: "#1e293b",
    backgroundSelected: "#064e3b",
    textSecondary: "#94a3b8",
    primary: "#10b981",
    primaryHover: "#059669",
    primaryLight: "#064e3b",
    primaryBorder: "#047857",
    border: "#334155",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
