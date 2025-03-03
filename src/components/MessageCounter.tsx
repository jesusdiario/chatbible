
interface MessageCounterProps {
  currentCount: number;
  maxCount: number;
  className?: string;
}

const MessageCounter = ({ currentCount, maxCount, className = "" }: MessageCounterProps) => {
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      {currentCount}/{maxCount} mensagens enviadas este mês
    </div>
  );
};

export default MessageCounter;
