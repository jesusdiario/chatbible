
import React from "react";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
  displayName: string;
  email: string;
  onDisplayNameChange: (value: string) => void;
}

const ProfileForm = ({ displayName, email, onDisplayNameChange }: ProfileFormProps) => {
  return (
    <>
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">Nome</label>
        <Input
          id="name"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="Seu nome"
        />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          value={email || ''}
          disabled
          readOnly
        />
      </div>
    </>
  );
};

export default ProfileForm;
