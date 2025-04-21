
import { FC } from 'react';

interface MessageAvatarProps {
  isAssistant: boolean;
}

const MessageAvatar: FC<MessageAvatarProps> = ({ isAssistant }) => {
  if (isAssistant) {
    return (
      <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-token-main-surface-primary text-token-text-primary">
      </div>
    );
  }
  return null;
};

export default MessageAvatar;

