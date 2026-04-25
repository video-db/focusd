import type {
  AppInfo,
  ApiKeyInfo,
  ActivitySegment,
  AppUsageStat,
  DailySummary,
  DashboardData,
  DeepDiveResult,
  MicroSummary,
  OnboardingState,
  PermissionsState,
  RecordingState,
  ScreenSource,
  SessionSummary,
  Settings,
} from './types';

// Tray action payload — emitted from the tray menu when the user clicks
// start/stop on the recording controls.
export type TrayAction = 'start' | 'stop';

// Request/response channels: channel name → { args tuple, return type }.
// Single source of truth for every ipcMain.handle / ipcRenderer.invoke pair.
export interface IpcInvokeChannels {
  'app:info':                         { args: [];                              return: AppInfo };
  'app:logDir':                       { args: [];                              return: string };

  'onboarding:state':                 { args: [];                              return: OnboardingState };
  'onboarding:validateKey':           { args: [apiKey: string];                return: { valid: boolean; error?: string } };
  'onboarding:saveKey':               { args: [apiKey: string];                return: void };
  'onboarding:clearKey':              { args: [];                              return: void };
  'onboarding:complete':              { args: [];                              return: void };
  'onboarding:getKeyInfo':            { args: [];                              return: ApiKeyInfo };
  'onboarding:getPermissions':        { args: [];                              return: PermissionsState };
  'onboarding:requestMicPermission':  { args: [];                              return: boolean };
  'onboarding:openScreenPermissions': { args: [];                              return: void };
  'onboarding:openMicPermissions':    { args: [];                              return: void };

  'capture:listScreens':              { args: [];                              return: ScreenSource[] };
  'capture:start':                    { args: [screenId?: string];             return: { sessionId: string } };
  'capture:stop':                     { args: [];                              return: void };
  'capture:status':                   { args: [];                              return: { recording: boolean; sessionId?: string; startedAt?: number } };

  'summary:generateNow':              { args: [];                              return: string };
  'summary:daily':                    { args: [date: string];                  return: DailySummary | null };
  'summary:daily-refresh':            { args: [date: string];                  return: DailySummary | null };
  'summary:session-list':             { args: [date: string];                  return: SessionSummary[] };
  'summary:micro-list':               { args: [start: number, end: number];    return: MicroSummary[] };
  'summary:segments':                 { args: [start: number, end: number];    return: ActivitySegment[] };
  'summary:deep-dive':                { args: [start: number, end: number];    return: DeepDiveResult };

  'dashboard:today':                  { args: [];                              return: DashboardData };
  'dashboard:app-usage':              { args: [date: string];                  return: AppUsageStat[] };

  'settings:get':                     { args: [];                              return: Settings };
  'settings:update':                  { args: [partial: Partial<Settings>];    return: void };
}

// Push channels: channel name → payload type.
// Used by main → renderer pushes via webContents.send and renderer
// subscriptions via ipcRenderer.on.
export interface IpcSendChannels {
  'recording-state': RecordingState;
  'new-summary':     MicroSummary;
  'idle-state':      boolean;
  'tray-action':     TrayAction;
}
