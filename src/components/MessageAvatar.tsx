const MessageAvatar = ({
  isAssistant
}: {
  isAssistant: boolean;
}) => {
  if (isAssistant) {
    return <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-token-main-surface-primary text-token-text-primary">
        <img src="/lovable-uploads/fb2119a5-5937-4cb3-9f11-bea6e009930f.png" alt="Leão com coroa" className="h-[50px] w-[50px]" />
      </div>;
  }
  return null;
};
export default MessageAvatar;