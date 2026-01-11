"use client";

import { useEffect, useRef } from "react";

type Props = {
  audio: Blob;
  onStart?: () => void;
  onEnd?: () => void;
};

export default function AudioPlayer({ audio, onStart, onEnd }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audio || audio.size === 0) return;

    const url = URL.createObjectURL(audio);
    const el = new Audio(url);

    audioRef.current = el;
    el.setAttribute("playsinline", "");

    el.onplay = () => onStart?.();

    el.onended = () => {
      onEnd?.();
      URL.revokeObjectURL(url); // ✅ SOLO AQUÍ
    };

    el.onerror = () => {
      URL.revokeObjectURL(url);
      onEnd?.();
    };

    el.play().catch(err => {
      console.warn("Audio play blocked:", err);
      URL.revokeObjectURL(url);
      onEnd?.();
    });

    return () => {
      el.pause();
      audioRef.current = null;
      // 🚫 NO revoke aquí
    };
  }, [audio]);

  return null;
}
