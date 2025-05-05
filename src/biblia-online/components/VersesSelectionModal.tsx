
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/biblia-online/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BibliaButton } from "@/hooks/useVerseSelection";
import { Loader2 } from "lucide-react";

interface VersesSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseReference: string;
  buttons: BibliaButton[];
  isLoading: boolean;
  onButtonClick: (button: BibliaButton) => void;
}

export const VersesSelectionModal: React.FC<VersesSelectionModalProps> = ({
  isOpen,
  onClose,
  verseReference,
  buttons,
  isLoading,
  onButtonClick,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {verseReference}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 py-4">
            {buttons.map((button) => (
              <Button
                key={button.id}
                variant="outline"
                className="justify-center text-md font-medium h-auto py-3"
                onClick={() => onButtonClick(button)}
              >
                {button.button_name}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
