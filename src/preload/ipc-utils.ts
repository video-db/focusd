import { ipcRenderer, type IpcRendererEvent } from 'electron';
import type { IpcInvokeChannels, IpcSendChannels } from '../shared/ipc-contract';

// Typed wrapper for ipcRenderer.invoke. Channel + args + return are
// checked against IpcInvokeChannels.
export function ipcInvoke<K extends keyof IpcInvokeChannels>(
  channel: K,
  ...args: IpcInvokeChannels[K]['args']
): Promise<IpcInvokeChannels[K]['return']> {
  return ipcRenderer.invoke(channel, ...args);
}

// Typed wrapper for ipcRenderer.on. Channel is checked against
// IpcSendChannels; the callback parameter is typed automatically.
// Returns an unsubscribe function.
export function ipcOn<K extends keyof IpcSendChannels>(
  channel: K,
  cb: (payload: IpcSendChannels[K]) => void,
): () => void {
  const handler = (_: IpcRendererEvent, payload: IpcSendChannels[K]) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
