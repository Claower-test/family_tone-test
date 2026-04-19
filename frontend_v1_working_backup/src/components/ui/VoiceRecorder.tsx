/**
 * @file VoiceRecorder component
 * @description In-browser audio recording with MediaRecorder API
 * @module components/ui/VoiceRecorder
 */

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onUpload: (blob: Blob, duration: number) => Promise<void>;
  isUploading: boolean;
}

export function VoiceRecorder({ onUpload, isUploading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      setRecordedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setPreviewUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Не удалось получить доступ к микрофону');
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  async function handleSend() {
    if (recordedBlob) {
      await onUpload(recordedBlob, duration);
      handleDiscard();
    }
  }

  function handleDiscard() {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setDuration(0);
    audioChunks.current = [];
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-[32px] bg-neutral-50 border-2 border-dashed border-neutral-200">
      <AnimatePresence mode="wait">
        {recordedBlob && previewUrl ? (
          <motion.div
            key="preview"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <div className="text-center mb-2">
              <h3 className="font-bold text-neutral-900">Послушайте запись</h3>
              <p className="text-xs text-neutral-400 mt-1">Все отлично? Можно отправлять в архив</p>
            </div>
            
            <audio controls src={previewUrl} className="w-full h-10" />

            <div className="flex gap-3 w-full">
              <button
                onClick={handleDiscard}
                className="flex-1 py-3.5 rounded-2xl border-2 border-neutral-200 text-sm font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
              >
                Удалить
              </button>
              <button
                onClick={handleSend}
                disabled={isUploading}
                className="flex-[2] py-3.5 rounded-2xl cta-btn text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Сохранить историю'}
              </button>
            </div>
          </motion.div>
        ) : !isRecording ? (
          <motion.button
            key="start"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            onClick={startRecording}
            disabled={isUploading}
            className="w-20 h-20 rounded-full cta-btn flex items-center justify-center text-white shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Icon icon="solar:microphone-3-bold" className="text-3xl" />
          </motion.button>
        ) : (
          <motion.div
            key="recording"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-2xl font-black text-neutral-900 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Icon icon="solar:stop-bold" className="text-3xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        {!recordedBlob && (
          <>
            <h3 className="font-bold text-neutral-900">
              {isRecording ? 'Идет запись...' : 'Готовы рассказать историю?'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {isRecording 
                ? 'Нажмите на квадрат, чтобы завершить' 
                : 'Нажмите на микрофон для начала записи'}
            </p>
          </>
        )}
      </div>

      {isRecording && (
        <div className="flex gap-1 h-8 items-end">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [10, Math.random() * 30 + 10, 10],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.5 + Math.random() * 0.5,
                delay: i * 0.05 
              }}
              className="w-1 bg-orange-400 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
