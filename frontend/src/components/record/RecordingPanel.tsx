import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useQueryClient } from '@tanstack/react-query';
import { audioService } from '@/services/audio.service';
import { recordsService } from '@/services/records.service';
import { cn } from '@/utils/cn';

type PanelState = 'pending' | 'recording' | 'stopped' | 'error';
type ErrorKind = 'mic' | 'short' | 'generic';

const WAVE_BARS = [
  { h: 28, delay: 0, color: 'bg-brand-400/60' },
  { h: 40, delay: 0.07, color: 'bg-brand-400/70' },
  { h: 20, delay: 0.14, color: 'bg-brand-400/80' },
  { h: 48, delay: 0.1, color: 'bg-brand-400/90' },
  { h: 36, delay: 0.21, color: 'bg-brand-200/80' },
  { h: 44, delay: 0.04, color: 'bg-brand-400' },
  { h: 24, delay: 0.18, color: 'bg-brand-200/70' },
  { h: 38, delay: 0.25, color: 'bg-brand-400/80' },
  { h: 32, delay: 0.09, color: 'bg-brand-400/60' },
  { h: 16, delay: 0.28, color: 'bg-brand-400/70' },
  { h: 42, delay: 0.16, color: 'bg-brand-200/60' },
  { h: 26, delay: 0.05, color: 'bg-brand-400/80' },
  { h: 46, delay: 0.2, color: 'bg-brand-400/90' },
  { h: 18, delay: 0.3, color: 'bg-brand-400/50' },
  { h: 34, delay: 0.12, color: 'bg-brand-200/70' },
  { h: 22, delay: 0.23, color: 'bg-brand-400/60' },
  { h: 40, delay: 0.02, color: 'bg-brand-400/80' },
  { h: 30, delay: 0.27, color: 'bg-brand-200/50' },
  { h: 36, delay: 0.08, color: 'bg-brand-400/70' },
  { h: 44, delay: 0.15, color: 'bg-brand-400/90' },
  { h: 20, delay: 0.32, color: 'bg-brand-400/60' },
] as const;

function formatTimer(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function defaultTitle(): string {
  const d = new Date();
  return `История от ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

interface RecordingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecordingPanel({ isOpen, onClose }: RecordingPanelProps) {
  const [state, setState] = useState<PanelState>('recording');
  const [seconds, setSeconds] = useState(0);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorKind, setErrorKind] = useState<ErrorKind>('generic');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPreviewPlaying(false);
  }, []);

  const cleanup = useCallback(() => {
    stopTimer();
    stopPreview();
    blobRef.current = null;
    setSeconds(0);
    setState('pending');
    setTitle('');
    setErrorMsg('');
    setErrorKind('generic');
    setIsSaving(false);
  }, [stopTimer, stopPreview]);

  useEffect(() => {
    if (!isOpen) return;

    cleanup();

    let cancelled = false;

    async function begin() {
      try {
        await audioService.start();
        if (cancelled) {
          audioService.abort();
          return;
        }
        setState('recording');
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } catch {
        if (!cancelled) {
          setState('error');
          setErrorKind('mic');
          setErrorMsg('Нет доступа к микрофону');
        }
      }
    }

    begin();

    return () => {
      cancelled = true;
      stopTimer();
      audioService.abort();
    };
  }, [isOpen, cleanup, stopTimer]);

  async function handleStop() {
    stopTimer();
    try {
      const blob = await audioService.stop();
      if (seconds < 1) {
        setState('error');
        setErrorKind('short');
        setErrorMsg('Запись слишком короткая. Минимум 1 секунда.');
        return;
      }
      blobRef.current = blob;
      setTitle(defaultTitle());
      setState('stopped');
    } catch {
      setState('error');
      setErrorMsg('Ошибка записи');
    }
  }

  function handleTogglePreview() {
    if (isPreviewPlaying) {
      stopPreview();
      return;
    }
    if (!blobRef.current) return;

    const url = URL.createObjectURL(blobRef.current);
    const audio = new Audio(url);

    const onEnd = () => {
      clearTimeout(timeout);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onEnd);
      URL.revokeObjectURL(url);
      setIsPreviewPlaying(false);
      previewAudioRef.current = null;
    };

    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onEnd);

    // Safety timeout — short webm files may have invalid duration metadata
    const safetyMs = Math.max(seconds * 1000 + 1000, 2000);
    const timeout = setTimeout(onEnd, safetyMs);

    audio.play();
    previewAudioRef.current = audio;
    setIsPreviewPlaying(true);
  }

  async function handleRecordAgain() {
    try {
      setState('pending');
      setErrorMsg('');
      setErrorKind('generic');
      setSeconds(0);
      await audioService.start();
      setState('recording');
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setState('error');
      setErrorKind('mic');
      setErrorMsg('Нет доступа к микрофону');
    }
  }

  function handleDelete() {
    blobRef.current = null;
    cleanup();
    onClose();
  }

  async function handleSave() {
    if (!blobRef.current || !title.trim()) return;
    setIsSaving(true);
    try {
      await recordsService.upload(blobRef.current, title.trim(), seconds);
      await queryClient.invalidateQueries({ queryKey: ['records'] });
      cleanup();
      onClose();
    } catch {
      setErrorMsg('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRetry() {
    try {
      await audioService.start();
      setErrorMsg('');
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setErrorMsg('Нет доступа к микрофону. Разрешите доступ в настройках браузера.');
    }
  }

  function handleBackdrop() {
    audioService.abort();
    cleanup();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="record-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={state === 'error' ? handleBackdrop : undefined}
          />
          <motion.div
            className="record-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-2xl mx-auto px-6 py-8">
              {/* Handle */}
              <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-8" />

              {/* Title */}
              <div className="text-center mb-8">
                <p className="text-lg font-bold text-neutral-900 leading-snug">
                  Запись
                </p>
              </div>

              {state === 'pending' && (
                <>
                  {/* Static waveform placeholder */}
                  <div className="flex items-end justify-center gap-[3px] h-16 mb-4">
                    {WAVE_BARS.map((_bar, i) => (
                      <div
                        key={i}
                        className="w-[3px] rounded-full bg-neutral-200"
                        style={{ height: '4px' }}
                      />
                    ))}
                  </div>

                  <p className="text-center text-sm text-neutral-400 font-medium mb-8">
                    Разрешите доступ к микрофону
                  </p>

                  {/* Main button — paused style */}
                  <div className="flex items-center justify-center">
                    <button
                      className="w-16 h-16 rounded-full cta-btn flex items-center justify-center opacity-50"
                      disabled
                    >
                      <Icon icon="solar:microphone-3-bold" className="text-white text-2xl relative z-10" />
                    </button>
                  </div>
                </>
              )}

              {state === 'error' && (
                <div className="text-center py-8">
                  <div className="relative w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="solar:microphone-3-bold" className="text-2xl text-red-400 relative" />
                    <div className="absolute w-8 h-[2px] bg-red-400 rotate-45 rounded-full" />
                  </div>
                  <p className="text-sm text-neutral-600 mb-8">{errorMsg}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleBackdrop}
                      className="flex-1 rounded-xl border-[1.5px] border-[#e5e5e5] py-3.5 text-sm font-semibold text-neutral-500 transition-all hover:border-[#d4d4d4] hover:bg-[#fafafa]"
                    >
                      Закрыть
                    </button>
                    {errorKind === 'mic' && (
                      <button
                        onClick={handleRetry}
                        className="flex-1 cta-btn rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/15"
                      >
                        Разрешить доступ
                      </button>
                    )}
                    {errorKind === 'short' && (
                      <button
                        onClick={handleRecordAgain}
                        className="flex-1 cta-btn rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/15"
                      >
                        Записать снова
                      </button>
                    )}
                  </div>
                </div>
              )}

              {state === 'recording' && (
                <>
                  {/* Waveform */}
                  <div className="flex items-end justify-center gap-[3px] h-16 mb-4">
                    {WAVE_BARS.map((bar, i) => (
                      <div
                        key={i}
                        className={cn('wave-bar w-[3px] rounded-full', bar.color)}
                        style={{ '--h': `${bar.h}px`, animationDelay: `${bar.delay}s` } as React.CSSProperties}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <p className="text-center text-sm text-neutral-400 font-medium mb-8 tabular-nums">
                    {formatTimer(seconds)}
                  </p>

                  {/* Stop button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleStop}
                      className="w-16 h-16 rounded-full cta-btn flex items-center justify-center relative"
                      style={{ animation: 'recordPulse 1.5s ease-in-out infinite' }}
                    >
                      <Icon icon="solar:stop-bold" className="text-white text-2xl relative z-10" />
                    </button>
                  </div>
                </>
              )}

              {state === 'stopped' && (
                <>
                  {/* Timer frozen */}
                  <p className="text-center text-sm text-neutral-400 font-medium mb-6 tabular-nums">
                    {formatTimer(seconds)}
                  </p>

                  {/* Play + Title input */}
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={handleTogglePreview}
                      className={cn(
                        'flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                        isPreviewPlaying ? 'bg-brand-100' : 'bg-neutral-100',
                      )}
                    >
                      {isPreviewPlaying ? (
                        <div className="flex items-end gap-[2px] h-4">
                          <div className="play-bar" style={{ '--h': '12px', animationDelay: '0s' } as React.CSSProperties} />
                          <div className="play-bar" style={{ '--h': '16px', animationDelay: '0.15s' } as React.CSSProperties} />
                          <div className="play-bar" style={{ '--h': '10px', animationDelay: '0.3s' } as React.CSSProperties} />
                        </div>
                      ) : (
                        <Icon icon="solar:play-bold" className="text-lg text-neutral-400" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-[14px] border-[1.5px] border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-[#b0b0b0] focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/[0.08]"
                      placeholder="Название истории"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-center text-xs text-red-500 mb-4">{errorMsg}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="flex-1 rounded-xl border-[1.5px] border-[#e5e5e5] py-3.5 text-sm font-semibold text-neutral-500 transition-all hover:border-[#d4d4d4] hover:bg-[#fafafa] disabled:opacity-50"
                    >
                      Удалить
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !title.trim()}
                      className={cn(
                        'flex-1 cta-btn rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/15',
                        (isSaving || !title.trim()) && 'opacity-70 pointer-events-none',
                      )}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить историю'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
