import { app, desktopCapturer } from 'electron';
import { log } from './services/logger';
import type { PermissionStatus } from '../shared/types';

const TAG = 'UTIL';

// True when running unpackaged under `electron-vite dev`. Uses app.isPackaged
// rather than NODE_ENV because the dev script does not set NODE_ENV.
export function isDev(): boolean {
  return !app.isPackaged;
}

// Dev-only macOS TCC workaround. getMediaAccessStatus('screen') is read-only
// and does not register the unpackaged dev binary (Electron / VS Code helper /
// iTerm helper) with TCC, so it never appears in System Settings → Privacy →
// Screen Recording on first run and the user has nothing to toggle.
// Calling desktopCapturer.getSources once forces registration. Packaged builds
// register on their own first capture, hence the isDev() gate. Safe to call on
// every permission read — no-op when packaged or already granted.
export async function ensureScreenPermissionRegistered(screen: PermissionStatus): Promise<void> {
  if (!isDev() || screen === 'granted') return;
  try {
    await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } });
    log(TAG, 'Screen permission warmup invoked (dev mode)');
  } catch (err) {
    log(TAG, `Screen permission warmup failed: ${(err as Error).message}`);
  }
}
