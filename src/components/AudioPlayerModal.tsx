import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Play, Pause, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/useAudio';
interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioBase64?: string;
  isLoading: boolean;
}
const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  isOpen,
  onClose,
  audioBase64,
  isLoading
}) => {
  const {
    isPlaying,
    progress,
    duration,
    play,
    pause,
    stop,
    setBase64Source
  } = useAudio(undefined, {
    onEnded: () => {},
    autoPlay: true
  });

  // Set audio source when available and modal is open
  useEffect(() => {
    if (audioBase64 && isOpen && !isLoading) {
      setBase64Source(audioBase64);
    }
  }, [audioBase64, isOpen, isLoading, setBase64Source]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stop();
    }
  }, [isOpen, stop]);
  const handleClose = () => {
    onClose();
  };
  const handleStop = () => {
    stop();
    onClose();
  };
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? progress / duration * 100 : 0;
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">
            {isLoading ? 'Preparando áudio...' : 'Reproduzindo'}
          </h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8" aria-label="Fechar">
            
          </Button>
        </div>

        {isLoading ? <div className="py-6 text-center">
            <p className="text-sm text-gray-600">Aguarde enquanto sintetizamos a fala</p>
            <div className="mt-3 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-gray-500 animate-pulse" style={{
            width: '100%'
          }}></div>
            </div>
          </div> : <div className="space-y-4">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-chatgpt-accent transition-all duration-200" style={{
            width: `${progressPercentage}%`
          }}></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" onClick={togglePlayPause} className="h-10 w-10 rounded-full" disabled={isLoading} aria-label={isPlaying ? "Pausar" : "Reproduzir"}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleStop} className="h-10 w-10 rounded-full" disabled={isLoading} aria-label="Parar">
                <StopCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default AudioPlayerModal;