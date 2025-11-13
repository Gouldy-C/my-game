import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // File System APIs
  saveGame: (data: string, filename: string) =>
    ipcRenderer.invoke("fs:save-game", data, filename),
  loadGame: (filename: string) => ipcRenderer.invoke("fs:load-game", filename),
  getSaveDirectory: () => ipcRenderer.invoke("fs:get-save-directory"),
  listSaveFiles: () => ipcRenderer.invoke("fs:list-save-files"),
  deleteSaveFile: (filename: string) =>
    ipcRenderer.invoke("fs:delete-save-file", filename),

  // Window Management APIs
  toggleFullscreen: () => ipcRenderer.invoke("window:toggle-fullscreen"),
  isFullscreen: () => ipcRenderer.invoke("window:is-fullscreen"),
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  setAlwaysOnTop: (flag: boolean) =>
    ipcRenderer.invoke("window:set-always-on-top", flag),
  getWindowBounds: () => ipcRenderer.invoke("window:get-bounds"),
  setWindowBounds: (bounds: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => ipcRenderer.invoke("window:set-bounds", bounds),

  // System Information APIs
  getSystemInfo: () => ipcRenderer.invoke("system:get-info"),
  getNetworkStatus: () => ipcRenderer.invoke("system:get-network-status"),
  getMemoryUsage: () => ipcRenderer.invoke("system:get-memory-usage"),

  // Notifications API
  showNotification: (
    title: string,
    body: string,
    options?: { silent?: boolean }
  ) => ipcRenderer.invoke("notification:show", title, body, options),

  // Clipboard API
  copyToClipboard: (text: string) => ipcRenderer.invoke("clipboard:copy", text),
  readFromClipboard: () => ipcRenderer.invoke("clipboard:read"),

  // App Info APIs
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  getPlatform: () => ipcRenderer.invoke("app:get-platform"),

  // Event Listeners
  onWindowStateChange: (
    callback: (
      state: "maximized" | "minimized" | "normal" | "fullscreen"
    ) => void
  ) => {
    ipcRenderer.on("window:state-changed", (_event, state) => callback(state));
    // Return cleanup function
    return () => {
      ipcRenderer.removeAllListeners("window:state-changed");
    };
  },
  onWindowFocus: (callback: () => void) => {
    ipcRenderer.on("window:focus", () => callback());
    return () => {
      ipcRenderer.removeAllListeners("window:focus");
    };
  },
  onWindowBlur: (callback: () => void) => {
    ipcRenderer.on("window:blur", () => callback());
    return () => {
      ipcRenderer.removeAllListeners("window:blur");
    };
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
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
    };
  }
}
