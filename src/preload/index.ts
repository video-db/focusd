import { contextBridge } from 'electron';
import type { FocusdAPI } from '../shared/types';
import { ipcInvoke, ipcOn } from './ipc-utils';

const api: FocusdAPI = {
  app: {
    info: () => ipcInvoke('app:info'),
  },
  onboarding: {
    state: () => ipcInvoke('onboarding:state'),
    validateKey: (apiKey) => ipcInvoke('onboarding:validateKey', apiKey),
    saveKey: (apiKey) => ipcInvoke('onboarding:saveKey', apiKey),
    clearKey: () => ipcInvoke('onboarding:clearKey'),
    complete: () => ipcInvoke('onboarding:complete'),
    getPermissions: () => ipcInvoke('onboarding:getPermissions'),
    requestMicPermission: () => ipcInvoke('onboarding:requestMicPermission'),
    openScreenPermissions: () => ipcInvoke('onboarding:openScreenPermissions'),
    openMicPermissions: () => ipcInvoke('onboarding:openMicPermissions'),
    getKeyInfo: () => ipcInvoke('onboarding:getKeyInfo'),
  },
  capture: {
    start: (screenId) => ipcInvoke('capture:start', screenId),
    stop: () => ipcInvoke('capture:stop'),
    status: () => ipcInvoke('capture:status'),
    listScreens: () => ipcInvoke('capture:listScreens'),
  },
  summary: {
    generateNow: () => ipcInvoke('summary:generateNow'),
    daily: (date) => ipcInvoke('summary:daily', date),
    refreshDaily: (date) => ipcInvoke('summary:daily-refresh', date),
    sessionList: (date) => ipcInvoke('summary:session-list', date),
    microList: (start, end) => ipcInvoke('summary:micro-list', start, end),
    segments: (start, end) => ipcInvoke('summary:segments', start, end),
    deepDive: (start, end) => ipcInvoke('summary:deep-dive', start, end),
  },
  dashboard: {
    today: () => ipcInvoke('dashboard:today'),
    appUsage: (date) => ipcInvoke('dashboard:app-usage', date),
  },
  settings: {
    get: () => ipcInvoke('settings:get'),
    update: (s) => ipcInvoke('settings:update', s),
  },
  onRecordingStateChange: (cb) => ipcOn('recording-state', cb),
  onNewSummary: (cb) => ipcOn('new-summary', cb),
};

contextBridge.exposeInMainWorld('api', api);
