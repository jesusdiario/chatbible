
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import { useSidebarControl } from "@/hooks/useSidebarControl";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        currentPath="/profile"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[110px] md:pt-[120px] lg:pt-[130px] px-4 md:px-8 max-w-3xl mx-auto pb-10">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
