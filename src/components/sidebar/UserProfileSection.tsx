
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface UserProfileSectionProps {
  userProfile: {
    name: string;
    avatar_url: string | null;
  } | null;
  onToggle?: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ userProfile, onToggle }) => {
  const navigate = useNavigate();
  
  if (!userProfile) return null;
  
  const goToProfile = () => {
    navigate('/profile');
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  return (
    <div className="mb-6">
      <button className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50" onClick={goToProfile}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={userProfile.avatar_url || undefined} />
          <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-medium">{userProfile.name}</p>
          <p className="text-xs text-gray-500">Ver perfil</p>
        </div>
      </button>
    </div>
  );
};

export default UserProfileSection;
