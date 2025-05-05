
import React from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { BibleTranslation, Verse } from "../services/bibleService";
import { BibleButton } from "../hooks/useVerseSelection";
import { ArrowDown, ArrowUp, Copy, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VerseActionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

const VerseActionBottomSheet: React.FC<VerseActionBottomSheetProps> = ({
  open,
  onClose,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopyText = async () => {
    const text = getSelectedVersesText(currentTranslation);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Texto copiado",
        description: "Os versículos foram copiados para a área de transferência",
      });
    } catch (error) {
      console.error("Erro ao copiar texto:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto dos versículos",
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = (button: BibleButton) => {
    // Botão de cópia tem tratamento especial
    if (button.slug === "copiar") {
      handleCopyText();
      return;
    }

    // Para os outros botões, navegamos para a página do chat com o texto e prompt
    const verseText = getSelectedVersesText(currentTranslation);
    const initialPrompt = `${verseReference}\n\n${verseText}`;
    
    navigate(`/livros-da-biblia/versiculos/${button.slug}`, {
      state: {
        initialPrompt,
        systemPrompt: button.prompt_ai,
      },
    });
  };

  const drawerHeight = isExpanded ? "h-[70vh]" : "h-[35vh]";

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent 
        className={`transition-all duration-300 ${drawerHeight}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{verseReference}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleExpansion}
              className="rounded-full"
            >
              {isExpanded ? <ArrowDown /> : <ArrowUp />}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {isLoadingButtons ? (
              <div className="w-full flex justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              buttons.map((button) => (
                <Button
                  key={button.id}
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleButtonClick(button)}
                >
                  {button.slug === "copiar" ? (
                    <Copy className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {button.button_name}
                </Button>
              ))
            )}
          </div>
          
          <ScrollArea className="h-[calc(100%-7rem)] rounded-md border p-3 bg-gray-50">
            {selectedVerses.map((verse) => (
              <div key={verse.id} className="mb-2 text-sm">
                <span className="font-semibold text-xs text-gray-500">
                  {verse.book_name} {verse.chapter}:{verse.verse}
                </span>
                <p>
                  {verse[currentTranslation] || 
                   verse.text_naa || 
                   verse.text_nvi || 
                   verse.text_acf || 
                   verse.text_ara || 
                   verse.text_ntlh || 
                   verse.text_nvt || ''}
                </p>
              </div>
            ))}
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default VerseActionBottomSheet;
