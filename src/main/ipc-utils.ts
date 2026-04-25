import { app, ipcMain, type IpcMainInvokeEvent, type WebContents, type WebFrameMain } from 'electron';
import type { IpcInvokeChannels, IpcSendChannels } from '../shared/ipc-contract';
import { warn } from './services/logger';

const TAG = 'IPC-UTIL';

// Local dev-mode detector. Inlined here so this module has no cross-file
// dependency on a util module that may or may not exist on a given branch.
function isDev(): boolean {
  return !app.isPackaged;
}

// Best-effort sender-frame validation. Currently logs unexpected origins
// rather than throwing, so flipping this on is non-breaking. Future hardening
// can convert the warn() call into a thrown error once all expected origins
// are confirmed in the field.
export function validateEventFrame(frame: WebFrameMain): void {
  const url = frame.url;
  if (isDev()) {
    const dev = process.env.ELECTRON_RENDERER_URL;
    if (dev && url.startsWith(dev)) return;
    try {
      const host = new URL(url).host;
      if (host === 'localhost' || host.startsWith('localhost:') || host === '127.0.0.1') return;
    } catch {
      // fall through to warn
    }
  } else if (url.startsWith('file://')) {
    return;
  }
  warn(TAG, `Unexpected frame URL: ${url}`);
}

// Typed wrapper for ipcMain.handle. The channel must be a key of
// IpcInvokeChannels; the handler's args and return type are inferred from
// the contract. Sender frame is validated on every call.
export function ipcMainHandle<K extends keyof IpcInvokeChannels>(
  channel: K,
  handler: (
    ...args: IpcInvokeChannels[K]['args']
  ) => IpcInvokeChannels[K]['return'] | Promise<IpcInvokeChannels[K]['return']>,
): void {
  ipcMain.handle(channel, (event: IpcMainInvokeEvent, ...args: unknown[]) => {
    if (event.senderFrame) validateEventFrame(event.senderFrame);
    return handler(...(args as IpcInvokeChannels[K]['args']));
  });
}

// Typed wrapper for webContents.send. Channel and payload are checked
// against IpcSendChannels.
export function ipcWebContentsSend<K extends keyof IpcSendChannels>(
  channel: K,
  webContents: WebContents,
  payload: IpcSendChannels[K],
): void {
  webContents.send(channel, payload);
}
