/**
 * Type definitions for Electron APIs exposed via preload script
 * These types match the APIs defined in electron/preload.ts
 */

interface ElectronAPI {
  // File System
  saveGame: (data: string, filename: string) => Promise<void>;
  loadGame: (filename: string) => Promise<string | null>;
  getSaveDirectory: () => Promise<string>;
  listSaveFiles: () => Promise<string[]>;
  deleteSaveFile: (filename: string) => Promise<void>;

  // Window Management
  toggleFullscreen: () => Promise<void>;
  isFullscreen: () => Promise<boolean>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  setAlwaysOnTop: (flag: boolean) => Promise<void>;
  getWindowBounds: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  setWindowBounds: (bounds: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => Promise<void>;

  // System Info
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    version: string;
    cpuCount: number;
  }>;
  getNetworkStatus: () => Promise<{ online: boolean; type?: string }>;
  getMemoryUsage: () => Promise<{
    used: number;
    total: number;
    percentage: number;
  }>;

  // Notifications
  showNotification: (
    title: string,
    body: string,
    options?: { silent?: boolean }
  ) => Promise<void>;

  // Clipboard
  copyToClipboard: (text: string) => Promise<void>;
  readFromClipboard: () => Promise<string>;

  // App Info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;

  // Events
  onWindowStateChange: (
    callback: (
      state: "maximized" | "minimized" | "normal" | "fullscreen"
    ) => void
  ) => () => void;
  onWindowFocus: (callback: () => void) => () => void;
  onWindowBlur: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};

