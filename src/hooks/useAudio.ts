
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioOptions {
  onEnded?: () => void;
  autoPlay?: boolean;
}

interface UseAudioReturn {
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
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

      const updateProgress = () => {
        if (audio) {
          setProgress(audio.currentTime);
        }
      };

      const updateDuration = () => {
        if (audio) {
          setDuration(audio.duration);
          setIsLoading(false);
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        if (options?.onEnded) {
          options.onEnded();
        }
      };
      
      const handleLoadStart = () => setIsLoading(true);
      const handleLoaded = () => setIsLoading(false);
      
      const handleError = (error: any) => {
        console.error('Audio playback error:', error);
        setIsLoading(false);
      };

      // Set up event listeners
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadeddata', handleLoaded);
      audio.addEventListener('canplay', handleLoaded);
      audio.addEventListener('error', handleError);

      // Cleanup function
      return () => {
        if (audioRef.current) {
          const audio = audioRef.current;
          audio.removeEventListener('timeupdate', updateProgress);
          audio.removeEventListener('loadedmetadata', updateDuration);
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('loadstart', handleLoadStart);
          audio.removeEventListener('loadeddata', handleLoaded);
          audio.removeEventListener('canplay', handleLoaded);
          audio.removeEventListener('error', handleError);
          audio.pause();
          audio.src = '';
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Update source if initialSrc changes
  useEffect(() => {
    if (audioRef.current && initialSrc) {
      audioRef.current.src = initialSrc;
      if (options?.autoPlay) {
        audioRef.current.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [initialSrc, options?.autoPlay]);

  // Play the audio
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
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
        audioRef.current.play().catch(err => console.error('Error playing audio:', err));
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
          audioRef.current.play().catch(err => console.error('Error playing audio:', err));
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
