import "@ui/types/electron.ts";

/**
 * React hook for accessing Electron APIs
 * This provides type-safe access to all Electron APIs exposed via the preload script
 */

export function useElectronAPI(): NonNullable<Window["electronAPI"]> {
  if (!window.electronAPI) {
    throw new Error(
      "Electron API is not available. Make sure you're running in Electron."
    );
  }

  return window.electronAPI;
}

/**
 * Example usage in a React component:
 *
 * ```tsx
 * import { useElectronAPI } from "@ui/hooks/use-electron-api";
 *
 * function MyComponent() {
 *   const electronAPI = useElectronAPI();
 *
 *   const handleSave = async () => {
 *     const gameData = JSON.stringify({ score: 100, level: 5 });
 *     await electronAPI.saveGame(gameData, "save1.json");
 *   };
 *
 *   const handleLoad = async () => {
 *     const data = await electronAPI.loadGame("save1.json");
 *     if (data) {
 *       const gameState = JSON.parse(data);
 *       console.log(gameState);
 *     }
 *   };
 *
 *   const handleNotification = async () => {
 *     await electronAPI.showNotification("Match Found!", "Joining game...");
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSave}>Save Game</button>
 *       <button onClick={handleLoad}>Load Game</button>
 *       <button onClick={handleNotification}>Show Notification</button>
 *     </div>
 *   );
 * }
 * ```
 */
