'use client';

import { useState, useRef, useCallback } from 'react';

interface VoiceRecording {
  blob: Blob;
  durationMs: number;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    return '';
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(); // Kein Timeslice — ein vollstaendiger Chunk beim Stop
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setDurationMs(0);

      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch {
      throw new Error('Mikrofon-Zugriff nicht erlaubt');
    }
  }, []);

  const stopRecording = useCallback((): Promise<VoiceRecording> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        reject(new Error('Keine aktive Aufnahme'));
        return;
      }

      if (timerRef.current) clearInterval(timerRef.current);
      const duration = Date.now() - startTimeRef.current;

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        // Alle Tracks stoppen
        recorder.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setDurationMs(0);
        resolve({ blob, durationMs: duration });
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (timerRef.current) clearInterval(timerRef.current);
    recorder.stream.getTracks().forEach((t) => t.stop());
    if (recorder.state !== 'inactive') recorder.stop();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setDurationMs(0);
  }, []);

  return { isRecording, durationMs, startRecording, stopRecording, cancelRecording };
}
