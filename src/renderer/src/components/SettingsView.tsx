import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type MutableRefObject } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, Key, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Settings, ApiKeyInfo } from '../../../shared/types';

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => Promise<void>;
}

export default function SettingsView({ settings, onUpdate }: Props) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [keyValidating, setKeyValidating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState(false);
  const [keyInfo, setKeyInfo] = useState<ApiKeyInfo | null>(null);

  useEffect(() => {
    window.api.onboarding.getKeyInfo().then(setKeyInfo);
  }, []);

  const handleSaveKey = async () => {
    if (!newKey.trim()) return;
    setKeyValidating(true);
    setKeyError(null);

    const result = await window.api.onboarding.validateKey(newKey.trim());
    if (result.valid) {
      await window.api.onboarding.saveKey(newKey.trim());
      setKeySuccess(true);
      setKeyValidating(false);
      const updated = await window.api.onboarding.getKeyInfo();
      setKeyInfo(updated);
      setTimeout(() => {
        setShowKeyInput(false);
        setNewKey('');
        setKeySuccess(false);
      }, 1500);
    } else {
      setKeyError(result.error || 'Invalid API key');
      setKeyValidating(false);
    }
  };

  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl">Settings</h1>
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg">API Key</h2>
          </div>
          <div className="p-6">
            {showKeyInput ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">New API Key</label>
                  <input
                    type="password"
                    value={newKey}
                    onChange={(e) => { setNewKey(e.target.value); setKeyError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                    placeholder="Enter your VideoDB API key"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    autoFocus
                  />
                </div>
                {keyError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>{keyError}</span>
                  </div>
                )}
                {keySuccess && (
                  <div className="flex items-center gap-2 text-sm text-[#7AB88F]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>API key updated successfully</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveKey}
                    disabled={!newKey.trim() || keyValidating}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 disabled:opacity-50"
                  >
                    {keyValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{keyValidating ? 'Validating...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => { setShowKeyInput(false); setNewKey(''); setKeyError(null); }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">VideoDB API Key</p>
                    {keyInfo && keyInfo.source !== 'none' ? (
                      <p className="text-xs text-muted-foreground font-mono">{keyInfo.preview}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No key configured</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  Change Key
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Display Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg">Display</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block mb-1">Time Format</label>
                <p className="text-sm text-muted-foreground">
                  Choose between 12-hour or 24-hour time display
                </p>
              </div>
              <SelectDropdown
                value={settings.timeFormat}
                onValueChange={(v) => onUpdate({ timeFormat: v as Settings['timeFormat'] })}
                options={[
                  { value: '12h', label: '12-hour' },
                  { value: '24h', label: '24-hour' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Tracking Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg">Tracking</h2>
          </div>
          <div className="divide-y divide-border">
            <ToggleSetting
              label="Microphone"
                description="Capture your microphone input as supporting context"
                checked={settings.recordMic}
                onCheckedChange={(v) => onUpdate({ recordMic: v })}
              />
            <ToggleSetting
              label="Screen Capture"
                description="Capture screen activity for app and work detection"
                checked={settings.recordScreen}
                onCheckedChange={(v) => onUpdate({ recordScreen: v })}
              />
            <ToggleSetting
              label="System Audio"
                description="Capture app audio when supported by the recorder"
                checked={settings.recordSystemAudio}
                onCheckedChange={(v) => onUpdate({ recordSystemAudio: v })}
              />
          </div>
        </div>

        {/* Analysis Frequency */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg">Analysis Frequency</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Focusd first detects what you're working on, then creates quick insights as you go, and finally rolls it all into session recaps.
            </p>
          </div>
          <div className="divide-y divide-border">
            <DurationSetting
              label="Activity Detection"
              description="Groups raw activity into short work blocks that Focusd can classify."
              valueMins={settings.segmentFlushMins}
              onValueChange={(valueMins) => onUpdate({ segmentFlushMins: valueMins })}
            />
            <DurationSetting
              label="Quick Insights"
              description="Creates short AI summaries from your latest detected work blocks."
              valueMins={settings.microSummaryIntervalMins}
              onValueChange={(valueMins) => onUpdate({ microSummaryIntervalMins: valueMins })}
            />
            <DurationSetting
              label="Session Recaps"
              description="Rolls multiple quick insights into a broader session-level recap."
              valueMins={settings.sessionSummaryIntervalMins}
              onValueChange={(valueMins) => onUpdate({ sessionSummaryIntervalMins: valueMins })}
            />
          </div>
        </div>

        {/* Break Detection */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg">Break Detection</h2>
          </div>
          <div className="p-6">
            <DurationSetting
              label="Away Timeout"
              description="How long you need to be inactive before it counts as a break"
              valueMins={settings.idleThresholdMins}
              onValueChange={(valueMins) => onUpdate({ idleThresholdMins: valueMins })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex-1">
        <label className="block mb-1">{label}</label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-11 h-6 bg-switch-background rounded-full relative transition-colors data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform transform translate-x-0.5 data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </div>
  );
}

function DurationSetting({
  label,
  description,
  valueMins,
  onValueChange,
}: {
  label: string;
  description: string;
  valueMins: number;
  onValueChange: (valueMins: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => splitDurationParts(formatDurationInput(valueMins)));
  const [isEditing, setIsEditing] = useState(false);
  const hoursRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(splitDurationParts(formatDurationInput(valueMins)));
  }, [valueMins]);

  useEffect(() => {
    if (!isEditing) return;
    hoursRef.current?.focus();
    hoursRef.current?.select();
  }, [isEditing]);

  const resetDraft = () => setDraft(splitDurationParts(formatDurationInput(valueMins)));

  const commitValue = async (nextValue: string) => {
    const nextMinutes = parseDurationInput(nextValue);
    if (nextMinutes === null) {
      resetDraft();
      setIsEditing(false);
      return;
    }

    setDraft(splitDurationParts(formatDurationInput(nextMinutes)));
    if (nextMinutes !== valueMins) {
      await onValueChange(nextMinutes);
    }
    setIsEditing(false);
  };

  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex-1">
        <label className="block mb-1">{label}</label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="w-[240px]">
        {isEditing ? (
          <div
            className="flex w-full items-center justify-between rounded-lg border border-border bg-input-background px-3 py-2 font-mono"
            onBlur={(e) => {
              const next = e.relatedTarget;
              if (next instanceof Node && e.currentTarget.contains(next)) return;
              void commitValue(joinDurationParts(draft.hours, draft.minutes, draft.seconds));
            }}
          >
            <DurationPartInput
              inputRef={hoursRef}
              value={draft.hours}
              unit="h"
              onChange={(value: string) => setDraft((current) => ({ ...current, hours: value }))}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void commitValue(joinDurationParts(draft.hours, draft.minutes, draft.seconds));
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  resetDraft();
                  setIsEditing(false);
                }
              }}
            />
            <DurationPartInput
              value={draft.minutes}
              unit="m"
              onChange={(value: string) => setDraft((current) => ({ ...current, minutes: value }))}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void commitValue(joinDurationParts(draft.hours, draft.minutes, draft.seconds));
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  resetDraft();
                  setIsEditing(false);
                }
              }}
            />
            <DurationPartInput
              value={draft.seconds}
              unit="s"
              onChange={(value: string) => setDraft((current) => ({ ...current, seconds: value }))}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void commitValue(joinDurationParts(draft.hours, draft.minutes, draft.seconds));
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  resetDraft();
                  setIsEditing(false);
                }
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full rounded-lg border border-border bg-input-background px-4 py-2 text-left transition-colors hover:bg-muted"
          >
            {formatDurationLabel(valueMins)}
          </button>
        )}
      </div>
    </div>
  );
}

function DurationPartInput({
  inputRef,
  value,
  unit,
  onChange,
  onKeyDown,
}: {
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  value: string;
  unit: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
        onKeyDown={onKeyDown}
        onFocus={(e) => e.currentTarget.select()}
        className="w-8 bg-transparent text-center outline-none"
        aria-label={`${unit} value`}
      />
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

function splitDurationParts(value: string): { hours: string; minutes: string; seconds: string } {
  const padded = value.padStart(6, '0');
  return {
    hours: padded.slice(0, 2),
    minutes: padded.slice(2, 4),
    seconds: padded.slice(4, 6),
  };
}

function joinDurationParts(hours: string, minutes: string, seconds: string): string {
  return `${hours.trim().padStart(2, '0').slice(-2)}${minutes.trim().padStart(2, '0').slice(-2)}${seconds.trim().padStart(2, '0').slice(-2)}`;
}

function formatDurationInput(totalMinutes: number): string {
  const safeMinutes = Math.max(1, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
}

function parseDurationInput(value: string): number | null {
  if (!value) return null;

  const padded = value.padStart(6, '0');
  const hours = parseInt(padded.slice(0, 2), 10);
  const minutes = parseInt(padded.slice(2, 4), 10);
  const seconds = parseInt(padded.slice(4, 6), 10);

  if ([hours, minutes, seconds].some(Number.isNaN)) return null;
  if (minutes >= 60 || seconds >= 60) return null;

  const totalMinutes = Math.max(1, Math.ceil((hours * 3600 + minutes * 60 + seconds) / 60));
  return totalMinutes;
}

function formatDurationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
  if (minutes > 0) parts.push(minutes === 1 ? '1 min' : `${minutes} min`);

  return parts.join(' ') || '1 min';
}

function SelectDropdown({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center gap-2 px-4 py-2 bg-input-background rounded-lg border border-border hover:bg-muted transition-colors min-w-[150px] justify-between">
        <Select.Value />
        <ChevronDown className="w-4 h-4" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between text-sm"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
