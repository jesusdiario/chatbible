
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationManager from "@/components/TranslationManager";

const AdminTranslation = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold">Administração de Traduções</h1>
          </div>
        </div>
        <div className="flex-1 p-4 pb-8">
          <ScrollArea className="h-full">
            <TranslationManager />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AdminTranslation;
