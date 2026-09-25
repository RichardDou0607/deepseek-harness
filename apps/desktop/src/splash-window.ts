/** Native splash window: the application's visible surface while the Host boots. */

import { join } from 'node:path'
import { app, BrowserWindow, type BrowserWindowConstructorOptions } from 'electron'

/**
 * Resolve the borderless splash window's native material and controls.
 * @param platform - operating system hosting Electron.
 * @returns sandboxed window options with no preload bridge and no operations.
 */
export function splashWindowOptions(platform: NodeJS.Platform): BrowserWindowConstructorOptions {
  return {
    width: 520,
    height: 360,
    useContentSize: true,
    center: true,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    show: false,
    skipTaskbar: platform === 'win32',
    backgroundColor: platform === 'darwin' || platform === 'win32' ? '#00000000' : '#FFFFFF',
    ...(platform === 'darwin' ? {
      vibrancy: 'menu',
      visualEffectState: 'active',
    } as const : {}),
    ...(platform === 'win32' ? {
      backgroundMaterial: 'acrylic',
    } as const : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  }
}

/**
 * Open the process's sole splash window; the caller closes it once a product window shows.
 * @returns the visible window; a failed load destroys it before rejecting.
 */
export async function openSplashWindow(): Promise<BrowserWindow> {
  const window = new BrowserWindow(splashWindowOptions(process.platform))
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => { event.preventDefault() })
  try {
    await window.loadFile(join(app.getAppPath(), 'renderer', 'splash.html'))
  } catch (error) {
    if (!window.isDestroyed()) window.destroy()
    throw error
  }
  if (!window.isDestroyed()) window.show()
  return window
}
