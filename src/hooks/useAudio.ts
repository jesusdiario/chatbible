
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioOptions {
  onEnded?: () => void;
  autoPlay?: boolean;
}

interface UseAudioReturn {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  stop: () => void;
  setSource: (src: string) => void;
  setBase64Source: (base64Data: string, mimeType?: string) => void;
}

export const useAudio = (initialSrc?: string, options?: UseAudioOptions): UseAudioReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create or get the audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(initialSrc);
      audio.preload = 'metadata';
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsPaused(false);
      });
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        // Only set isPaused if we haven't reset to beginning (stop)
        setIsPaused(audio.currentTime > 0 && audio.currentTime < audio.duration);
      });
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadstart', () => setIsLoading(true));
      audio.addEventListener('loadeddata', () => setIsLoading(false));
      audio.addEventListener('canplay', () => setIsLoading(false));
      audio.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('play', () => {
          setIsPlaying(true);
          setIsPaused(false);
        });
        audio.removeEventListener('pause', () => {
          setIsPlaying(false);
          setIsPaused(audio.currentTime > 0 && audio.currentTime < audio.duration);
        });
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadstart', () => setIsLoading(true));
        audio.removeEventListener('loadeddata', () => setIsLoading(false));
        audio.removeEventListener('canplay', () => setIsLoading(false));
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Update source if initialSrc changes
  useEffect(() => {
    if (audioRef.current && initialSrc) {
      audioRef.current.src = initialSrc;
      if (options?.autoPlay) {
        audioRef.current.play().catch(handleError);
      }
    }
  }, [initialSrc]);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  const updateDuration = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    if (options?.onEnded) {
      options.onEnded();
    }
  }, [options?.onEnded]);

  const handleError = useCallback((error: any) => {
    console.error('Audio playback error:', error);
    setIsLoading(false);
  }, []);

  // Play the audio
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Pause the audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  // Toggle play/pause
  const toggle = useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        pause();
      } else {
        await play();
      }
    }
  }, [isPlaying, play, pause]);

  // Stop the audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    }
  }, []);

  // Set a new audio source URL
  const setSource = useCallback((src: string) => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = src;
      setIsLoading(true);
      
      if (wasPlaying || options?.autoPlay) {
        audioRef.current.play().catch(handleError);
      }
    }
  }, [options?.autoPlay]);

  // Set a base64 audio source
  const setBase64Source = useCallback((base64Data: string, mimeType: string = 'audio/mp3') => {
    if (audioRef.current) {
      try {
        const wasPlaying = !audioRef.current.paused;
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        audioRef.current.src = dataUrl;
        setIsLoading(true);
        
        if (wasPlaying || options?.autoPlay) {
          audioRef.current.play().catch(handleError);
        }
      } catch (error) {
        console.error('Error setting base64 audio source:', error);
        setIsLoading(false);
      }
    }
  }, [options?.autoPlay]);

  return {
    audio: audioRef.current,
    isPlaying,
    isPaused,
    isLoading,
    progress,
    duration,
    play,
    pause,
    toggle,
    stop,
    setSource,
    setBase64Source
  };
};
