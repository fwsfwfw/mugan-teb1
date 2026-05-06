import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, Zap, ZapOff } from 'lucide-react';

interface VolumeBoosterProps {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  onBoostToggle: (isBoosted: boolean) => void;
}

export const VolumeBooster: React.FC<VolumeBoosterProps> = ({ videoId, isPlaying, currentTime, onBoostToggle }) => {
  const [isBoosted, setIsBoosted] = useState(() => {
    try {
      return localStorage.getItem('volume_boost_enabled') === 'true';
    } catch { return false; }
  });
  const [boostLevel, setBoostLevel] = useState(2); // Default 2x boost
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const fetchAudioUrl = useCallback(async () => {
    try {
      const res = await fetch(`/api/youtubei/video/stream?id=${videoId}`);
      const data = await res.json();
      if (data.url) {
        setAudioUrl(data.url);
      }
    } catch (err) {
      console.error("Failed to fetch audio stream for booster:", err);
    }
  }, [videoId]);

  useEffect(() => {
    if (isBoosted) {
      fetchAudioUrl();
    } else {
      setAudioUrl(null);
    }
  }, [isBoosted, fetchAudioUrl]);

  useEffect(() => {
    if (isBoosted && audioUrl && audioRef.current) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          gainNodeRef.current = audioContextRef.current.createGain();
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }
        
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = boostLevel;
        }
      } catch (e) {
        console.error("AudioContext error:", e);
      }
    }
  }, [isBoosted, audioUrl, boostLevel]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && isBoosted) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isBoosted]);

  // Sync time
  useEffect(() => {
    if (isBoosted && audioRef.current && isPlaying) {
      const diff = Math.abs(audioRef.current.currentTime - currentTime);
      if (diff > 1.0) { // Increased threshold to prevent stutter
        audioRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, isBoosted, isPlaying]);

  const handleToggle = () => {
    const newBoosted = !isBoosted;
    setIsBoosted(newBoosted);
    onBoostToggle(newBoosted);
    
    if (newBoosted && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleToggle}
        className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all ${
          isBoosted 
            ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
            : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]'
        }`}
        title={isBoosted ? "כבה הגברת ווליום" : "הפעל הגברת ווליום (פי 2)"}
      >
        {isBoosted ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
      </button>
      <span className="text-[10px] text-[var(--muted)] font-bold">הגברה</span>

      {isBoosted && (
        <div className="flex flex-col items-center gap-1 bg-[var(--secondary)] p-1.5 rounded-xl border border-[var(--border)] absolute -top-24 z-50 shadow-xl">
          <span className="text-[10px] font-bold text-yellow-500">x{boostLevel.toFixed(1)}</span>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={boostLevel}
            onChange={(e) => setBoostLevel(parseFloat(e.target.value))}
            className="h-20 w-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-yellow-500"
            style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' } as any}
          />
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          crossOrigin="anonymous"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};
