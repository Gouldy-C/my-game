import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  clipboard,
  Notification,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { watch, existsSync, mkdirSync } from "fs";
import { readFile, writeFile, readdir, unlink } from "fs/promises";
import { isDev } from "./utils.js";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable hot reload in development using native file watcher
if (isDev()) {
  let reloadTimer: NodeJS.Timeout | null = null;

  try {
    // Watch the compiled output directory for changes
    watch(__dirname, { recursive: true }, (eventType, filename) => {
      // Ignore changes to non-JS files and debounce rapid changes
      if (filename && filename.endsWith(".js")) {
        if (reloadTimer) {
          clearTimeout(reloadTimer);
        }

        // Debounce reload to avoid multiple rapid reloads
        reloadTimer = setTimeout(() => {
          console.log(`File changed: ${filename}. Reloading...`);
          app.relaunch();
          app.exit(0);
        }, 300);
      }
    });

    console.log("Hot reload enabled. Watching for changes in:", __dirname);
  } catch (error) {
    console.warn("Failed to enable hot reload:", error);
  }
}

let mainWindow: BrowserWindow | null = null;

// Get save directory for game files
function getSaveDirectory(): string {
  const userDataPath = app.getPath("userData");
  const saveDir = path.join(userDataPath, "saves");
  if (!existsSync(saveDir)) {
    mkdirSync(saveDir, { recursive: true });
  }
  return saveDir;
}

function createWindow(): void {
  // Create the browser window with security best practices
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "My Game",
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Security: isolate context
      nodeIntegration: false, // Security: disable node integration in renderer
      sandbox: false, // Allow preload script to work
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();

    // Open DevTools in development
    if (isDev()) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Load the app
  if (isDev()) {
    const port = process.env.PORT || 6554;
    mainWindow.webContents
      .loadURL(`http://localhost:${port}`)
      .catch((error) => {
        console.error("Failed to load dev server:", error);
      });
  } else {
    mainWindow
      .loadFile(path.join(app.getAppPath(), "dist-ui", "index.html"))
      .catch((error) => {
        console.error("Failed to load production file:", error);
      });
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Window state change events
  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:state-changed", "maximized");
  });
  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:state-changed", "normal");
  });
  mainWindow.on("minimize", () => {
    mainWindow?.webContents.send("window:state-changed", "minimized");
  });
  mainWindow.on("restore", () => {
    mainWindow?.webContents.send("window:state-changed", "normal");
  });
  mainWindow.on("enter-full-screen", () => {
    mainWindow?.webContents.send("window:state-changed", "fullscreen");
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow?.webContents.send("window:state-changed", "normal");
  });
  mainWindow.on("focus", () => {
    mainWindow?.webContents.send("window:focus");
  });
  mainWindow.on("blur", () => {
    mainWindow?.webContents.send("window:blur");
  });
}

// IPC Handlers
function setupIpcHandlers(): void {
  // File System Handlers
  ipcMain.handle("fs:get-save-directory", () => {
    return getSaveDirectory();
  });

  ipcMain.handle(
    "fs:save-game",
    async (_event, data: string, filename: string) => {
      try {
        const saveDir = getSaveDirectory();
        const filePath = path.join(saveDir, filename);
        await writeFile(filePath, data, "utf-8");
      } catch (error) {
        console.error("Failed to save game:", error);
        throw error;
      }
    }
  );

  ipcMain.handle("fs:load-game", async (_event, filename: string) => {
    try {
      const saveDir = getSaveDirectory();
      const filePath = path.join(saveDir, filename);
      if (!existsSync(filePath)) {
        return null;
      }
      const data = await readFile(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Failed to load game:", error);
      throw error;
    }
  });

  ipcMain.handle("fs:list-save-files", async () => {
    try {
      const saveDir = getSaveDirectory();
      const files = await readdir(saveDir);
      return files.filter(
        (file) => file.endsWith(".json") || file.endsWith(".save")
      );
    } catch (error) {
      console.error("Failed to list save files:", error);
      return [];
    }
  });

  ipcMain.handle("fs:delete-save-file", async (_event, filename: string) => {
    try {
      const saveDir = getSaveDirectory();
      const filePath = path.join(saveDir, filename);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Failed to delete save file:", error);
      throw error;
    }
  });

  // Window Management Handlers
  ipcMain.handle("window:toggle-fullscreen", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  ipcMain.handle("window:is-fullscreen", () => {
    return mainWindow?.isFullScreen() ?? false;
  });

  ipcMain.handle("window:minimize", () => {
    mainWindow?.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle("window:close", () => {
    mainWindow?.close();
  });

  ipcMain.handle("window:set-always-on-top", (_event, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag);
  });

  ipcMain.handle("window:get-bounds", () => {
    return mainWindow?.getBounds() ?? { x: 0, y: 0, width: 1200, height: 800 };
  });

  ipcMain.handle(
    "window:set-bounds",
    (
      _event,
      bounds: { x?: number; y?: number; width?: number; height?: number }
    ) => {
      if (mainWindow) {
        mainWindow.setBounds(bounds);
      }
    }
  );

  // System Information Handlers
  ipcMain.handle("system:get-info", () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
      cpuCount: os.cpus().length,
    };
  });

  ipcMain.handle("system:get-network-status", () => {
    const interfaces = os.networkInterfaces();
    const hasConnection = interfaces && Object.keys(interfaces).length > 0;
    return {
      online: hasConnection,
      type: interfaces ? Object.keys(interfaces)[0] : undefined,
    };
  });

  ipcMain.handle("system:get-memory-usage", () => {
    const used = process.memoryUsage().heapUsed;
    const total = os.totalmem();
    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  });

  // Notification Handlers
  ipcMain.handle(
    "notification:show",
    (_event, title: string, body: string, options?: { silent?: boolean }) => {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body,
          silent: options?.silent ?? false,
        });
        notification.show();
      }
    }
  );

  // Clipboard Handlers
  ipcMain.handle("clipboard:copy", (_event, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle("clipboard:read", () => {
    return clipboard.readText();
  });

  // App Info Handlers
  ipcMain.handle("app:get-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("app:get-platform", () => {
    return process.platform;
  });
}

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// App lifecycle management
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  // macOS: Reopen window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation and handle navigation
app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Open external URLs in the default browser
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
});
